/**
 * Built-in Sample Datasets for AI Model Intelligence Lab
 * Allows 1-click AutoML analysis without needing local files.
 */

export const SAMPLE_DATASETS = [
  {
    id: 'titanic',
    title: 'Titanic Passenger Survival (Classification)',
    description: 'Binary classification dataset to predict passenger survival based on class, age, fare, and sex.',
    problemType: 'Classification',
    targetColumn: 'Survived',
    rows: 891,
    cols: 12,
    csvContent: `PassengerId,Survived,Pclass,Name,Sex,Age,SibSp,Parch,Ticket,Fare,Cabin,Embarked
1,0,3,"Braund, Mr. Owen Harris",male,22,1,0,A/5 21171,7.25,,S
2,1,1,"Cumings, Mrs. John Bradley (Florence Briggs Thayer)",female,38,1,0,PC 17599,71.2833,C85,C
3,1,3,"Heikkinen, Miss. Laina",female,26,0,0,STON/O2. 3101282,7.925,,S
4,1,1,"Futrelle, Mrs. Jacques Heath (Lily May Peel)",female,35,1,0,113803,53.1,C123,S
5,0,3,"Allen, Mr. William Henry",male,35,0,0,373450,8.05,,S
6,0,3,"Moran, Mr. James",male,29,0,0,330877,8.4583,,Q
7,0,1,"McCarthy, Mr. Timothy J",male,54,0,0,17463,51.8625,E46,S
8,0,3,"Palsson, Master. Gosta Leonard",male,2,3,1,349909,21.075,,S
9,1,3,"Johnson, Mrs. Oscar W (Elisabeth Vilhelmina Berg)",female,27,0,2,347742,11.1333,,S
10,1,2,"Nasser, Mrs. Nicholas (Adele Achem)",female,14,1,0,237736,30.0708,,C`
  },
  {
    id: 'wine',
    title: 'Wine Quality Benchmark (Regression)',
    description: 'Predict continuous wine quality rating (0-10) using chemical features like acidity, pH, and alcohol.',
    problemType: 'Regression',
    targetColumn: 'quality_score',
    rows: 1599,
    cols: 11,
    csvContent: `fixed_acidity,volatile_acidity,citric_acid,residual_sugar,chlorides,free_sulfur_dioxide,density,pH,sulphates,alcohol,quality_score
7.4,0.7,0.0,1.9,0.076,11.0,0.9978,3.51,0.56,9.4,5.8
7.8,0.88,0.0,2.6,0.098,25.0,0.9968,3.2,0.68,9.8,5.2
7.8,0.76,0.04,2.3,0.092,15.0,0.997,3.26,0.65,9.8,5.5
11.2,0.28,0.56,1.9,0.075,17.0,0.998,3.16,0.58,9.8,6.8
7.4,0.7,0.0,1.9,0.076,11.0,0.9978,3.51,0.56,9.4,5.7`
  },
  {
    id: 'iris',
    title: 'Iris Flower Species (Multi-Class Classification)',
    description: 'Classic botany benchmark for multi-class classification of Iris setosa, versicolor, and virginica.',
    problemType: 'Classification',
    targetColumn: 'species',
    rows: 150,
    cols: 5,
    csvContent: `sepal_length,sepal_width,petal_length,petal_width,species
5.1,3.5,1.4,0.2,Setosa
4.9,3.0,1.4,0.2,Setosa
6.7,3.0,5.2,2.3,Virginica
5.9,3.0,4.2,1.5,Versicolor
6.3,3.3,6.0,2.5,Virginica`
  },
  {
    id: 'housing',
    title: 'California House Prices (Regression)',
    description: 'Predict median house values using block population, income, rooms, and geographical coordinates.',
    problemType: 'Regression',
    targetColumn: 'median_house_value',
    rows: 20640,
    cols: 9,
    csvContent: `longitude,latitude,housing_median_age,total_rooms,total_bedrooms,population,households,median_income,median_house_value
-122.23,37.88,41,880,129,322,126,8.3252,452600
-122.22,37.86,21,7099,1106,2401,1138,8.3014,358500
-122.24,37.85,52,1467,190,496,177,7.2574,352100
-122.25,37.85,52,1274,235,558,219,5.6431,341300`
  }
]
