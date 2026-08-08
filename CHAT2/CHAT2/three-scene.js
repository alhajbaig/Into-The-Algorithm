/* ═══════════════════════════════════════════════════
   Three.js Neural Particle Field
   Animated synaptic connections + bloom glow
═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const canvas = document.getElementById('neural-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Scene setup
  const scene    = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, 80);

  // Resize handler
  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // ── Node Configuration ──
  const NODE_COUNT       = 100;
  const CONNECTION_DIST  = 28;
  const CONNECTION_MAX   = 200;
  const BOUNDS           = 90;

  // Node data
  const positions  = [];
  const velocities = [];
  const nodeData   = [];

  for (let i = 0; i < NODE_COUNT; i++) {
    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * BOUNDS * 2,
      (Math.random() - 0.5) * BOUNDS * 1.2,
      (Math.random() - 0.5) * BOUNDS
    );
    positions.push(pos);
    velocities.push(new THREE.Vector3(
      (Math.random() - 0.5) * 0.06,
      (Math.random() - 0.5) * 0.04,
      (Math.random() - 0.5) * 0.03
    ));
    nodeData.push({ size: Math.random() * 0.8 + 0.3, pulse: Math.random() * Math.PI * 2 });
  }

  // ── Node Geometry (Points) ──
  const nodeGeo  = new THREE.BufferGeometry();
  const nodePosArr = new Float32Array(NODE_COUNT * 3);
  const nodeColorArr = new Float32Array(NODE_COUNT * 3);

  for (let i = 0; i < NODE_COUNT; i++) {
    nodePosArr[i * 3]     = positions[i].x;
    nodePosArr[i * 3 + 1] = positions[i].y;
    nodePosArr[i * 3 + 2] = positions[i].z;
    // Color variation: purple ↔ blue
    const t = Math.random();
    nodeColorArr[i * 3]     = 0.3 + t * 0.4;   // R
    nodeColorArr[i * 3 + 1] = 0.1 + t * 0.2;   // G
    nodeColorArr[i * 3 + 2] = 0.6 + (1 - t) * 0.4; // B
  }

  nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePosArr, 3));
  nodeGeo.setAttribute('color',    new THREE.BufferAttribute(nodeColorArr, 3));

  const nodeMat = new THREE.PointsMaterial({
    size:           1.8,
    vertexColors:   true,
    transparent:    true,
    opacity:        0.85,
    sizeAttenuation: true,
    blending:       THREE.AdditiveBlending,
    depthWrite:     false,
  });

  const nodePoints = new THREE.Points(nodeGeo, nodeMat);
  scene.add(nodePoints);

  // ── Connection Lines ──
  const lineGeo = new THREE.BufferGeometry();
  const maxPts  = CONNECTION_MAX * 2;
  const linePosArr   = new Float32Array(maxPts * 3);
  const lineColorArr = new Float32Array(maxPts * 3);

  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePosArr, 3));
  lineGeo.setAttribute('color',    new THREE.BufferAttribute(lineColorArr, 3));
  lineGeo.setDrawRange(0, 0);

  const lineMat = new THREE.LineSegments(
    lineGeo,
    new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent:  true,
      opacity:      0.35,
      blending:     THREE.AdditiveBlending,
      depthWrite:   false,
    })
  );
  scene.add(lineMat);

  // ── Floating Spark Particles ──
  const SPARK_COUNT = 180;
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPos = new Float32Array(SPARK_COUNT * 3);
  const sparkVel = [];

  for (let i = 0; i < SPARK_COUNT; i++) {
    sparkPos[i * 3]     = (Math.random() - 0.5) * BOUNDS * 2.2;
    sparkPos[i * 3 + 1] = (Math.random() - 0.5) * BOUNDS * 1.4;
    sparkPos[i * 3 + 2] = (Math.random() - 0.5) * BOUNDS;
    sparkVel.push({
      x: (Math.random() - 0.5) * 0.1,
      y: (Math.random() - 0.5) * 0.08,
      z: (Math.random() - 0.5) * 0.05,
    });
  }

  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));

  const sparkMat = new THREE.PointsMaterial({
    size:           0.5,
    color:          0xa78bfa,
    transparent:    true,
    opacity:        0.4,
    blending:       THREE.AdditiveBlending,
    depthWrite:     false,
    sizeAttenuation: true,
  });

  const sparks = new THREE.Points(sparkGeo, sparkMat);
  scene.add(sparks);

  // ── Mouse Parallax ──
  const mouse = { x: 0, y: 0 };
  const targetRot = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Thinking State (pulsing) ──
  let isThinking  = false;
  let thinkTimer  = 0;

  window.setThinkingMode = function (on) {
    isThinking = on;
  };

  // ── Animation Loop ──
  let frame = 0;

  function animate() {
    requestAnimationFrame(animate);
    frame++;

    const t = frame * 0.01;

    // ─ Update node positions ─
    for (let i = 0; i < NODE_COUNT; i++) {
      const p = positions[i];
      const v = velocities[i];

      p.add(v);

      // Bounce off bounds
      if (Math.abs(p.x) > BOUNDS) v.x *= -1;
      if (Math.abs(p.y) > BOUNDS * 0.7) v.y *= -1;
      if (Math.abs(p.z) > BOUNDS * 0.6) v.z *= -1;

      // Pulse size
      const pulse = 1 + 0.15 * Math.sin(t * 2 + nodeData[i].pulse);
      const thinkBoost = isThinking ? (1 + 0.4 * Math.sin(t * 8 + i)) : 1;

      nodePosArr[i * 3]     = p.x;
      nodePosArr[i * 3 + 1] = p.y;
      nodePosArr[i * 3 + 2] = p.z;

      // Pulse color brightness
      const bright = pulse * thinkBoost;
      nodeColorArr[i * 3]     = Math.min(1, (0.3 + (i / NODE_COUNT) * 0.4) * bright);
      nodeColorArr[i * 3 + 1] = Math.min(1, (0.1 + (i / NODE_COUNT) * 0.2) * bright);
      nodeColorArr[i * 3 + 2] = Math.min(1, (0.6 + ((NODE_COUNT - i) / NODE_COUNT) * 0.4) * bright);
    }

    nodeGeo.attributes.position.needsUpdate = true;
    nodeGeo.attributes.color.needsUpdate    = true;

    // ─ Update connections ─
    let lineIdx = 0;
    for (let i = 0; i < NODE_COUNT && lineIdx < CONNECTION_MAX; i++) {
      for (let j = i + 1; j < NODE_COUNT && lineIdx < CONNECTION_MAX; j++) {
        const dist = positions[i].distanceTo(positions[j]);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST);
          const idx6  = lineIdx * 6;

          linePosArr[idx6]     = positions[i].x;
          linePosArr[idx6 + 1] = positions[i].y;
          linePosArr[idx6 + 2] = positions[i].z;
          linePosArr[idx6 + 3] = positions[j].x;
          linePosArr[idx6 + 4] = positions[j].y;
          linePosArr[idx6 + 5] = positions[j].z;

          const boost = isThinking ? 1.5 : 1;
          lineColorArr[idx6]     = 0.5 * alpha * boost;
          lineColorArr[idx6 + 1] = 0.2 * alpha * boost;
          lineColorArr[idx6 + 2] = 0.9 * alpha * boost;
          lineColorArr[idx6 + 3] = 0.3 * alpha * boost;
          lineColorArr[idx6 + 4] = 0.5 * alpha * boost;
          lineColorArr[idx6 + 5] = 1.0 * alpha * boost;

          lineIdx++;
        }
      }
    }

    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate    = true;
    lineGeo.setDrawRange(0, lineIdx * 2);

    // ─ Update sparks ─
    for (let i = 0; i < SPARK_COUNT; i++) {
      sparkPos[i * 3]     += sparkVel[i].x;
      sparkPos[i * 3 + 1] += sparkVel[i].y + 0.008;  // slow drift up
      sparkPos[i * 3 + 2] += sparkVel[i].z;

      // Wrap around
      if (sparkPos[i * 3 + 1] > BOUNDS * 0.7) {
        sparkPos[i * 3]     = (Math.random() - 0.5) * BOUNDS * 2.2;
        sparkPos[i * 3 + 1] = -BOUNDS * 0.7;
      }
    }
    sparkGeo.attributes.position.needsUpdate = true;

    // ─ Parallax rotation ─
    targetRot.x += (mouse.y * 0.03 - targetRot.x) * 0.04;
    targetRot.y += (mouse.x * 0.05 - targetRot.y) * 0.04;

    scene.rotation.x = targetRot.x;
    scene.rotation.y = targetRot.y;

    // Slow auto-rotate
    scene.rotation.y += 0.0008;

    renderer.render(scene, camera);
  }

  animate();

  console.log('[NeuralMind] Three.js neural scene initialized');
})();
