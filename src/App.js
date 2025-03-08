import React, { useState } from 'react';
import './App.css';

// 食物数据库
const foodDatabase = {
  鸡蛋: { protein: 13.3, carbs: 1.5, unit: '个(50g)' },
  牛奶: { protein: 3.3, carbs: 5.0, unit: '100ml' },
  鸡胸肉: { protein: 23.1, carbs: 0, unit: '100g' },
  牛肉: { protein: 26.1, carbs: 0, unit: '100g' },
  三文鱼: { protein: 20.4, carbs: 0, unit: '100g' },
  虾: { protein: 20.1, carbs: 0.2, unit: '100g' },
  面条: { protein: 3.0, carbs: 25.0, unit: '100g干重' },
  米饭: { protein: 2.6, carbs: 28.0, unit: '100g干重' }
};

// 添加每餐营养素比例配置
const MEAL_RATIOS = {
  training: {
    breakfast: { carbs: 0.15, protein: 0.20 },
    postWorkout: { carbs: 0.35, protein: 0.20 },
    lunch: { carbs: 0.20, protein: 0.20 },
    dinner: { carbs: 0.20, protein: 0.20 },
    snacks: { carbs: 0.10, protein: 0.20 }
  },
  rest: {
    breakfast: { carbs: 0.15, protein: 0.20 },
    lunch: { carbs: 0.40, protein: 0.30 },
    dinner: { carbs: 0.35, protein: 0.30 },
    snacks: { carbs: 0.10, protein: 0.20 }
  }
};

// 添加食物参考量配置
const FOOD_REFERENCES = {
  carbs: {
    rice: { gram: 100, carbs: 28 }, // 100g米饭含28g碳水
    noodles: { gram: 100, carbs: 25 }, // 100g面条含25g碳水
    sweetPotato: { gram: 100, carbs: 20 }, // 100g红薯含20g碳水
  },
  protein: {
    chicken: { gram: 100, protein: 23.1 }, // 100g鸡胸肉含23.1g蛋白质
    egg: { gram: 50, protein: 6.5 }, // 一个鸡蛋(50g)含6.5g蛋白质
    fish: { gram: 100, protein: 20.4 }, // 100g鱼肉含20.4g蛋白质
  }
};

// 添加食物数据库，包含碳水率和蛋白质率
const FOOD_DATABASE = {
  主食: {
    '米饭(一般)': { carbRatio: 0.30, proteinRatio: 0.03 },
    '面条(熟)': { carbRatio: 0.23, proteinRatio: 0.04 },
    '馒头': { carbRatio: 0.50, proteinRatio: 0.03 },
    '米粉(干)': { carbRatio: 0.75, proteinRatio: 0.02 }
  },
  蛋白质: {
    '瘦肉(熟)': { carbRatio: 0, proteinRatio: 0.25 },
    '鸡蛋': { carbRatio: 0, proteinRatio: 0.12, unitWeight: 50 }, // 每个约50g
    '蛋白粉': { carbRatio: 0, proteinRatio: 0.75 },
    '牛奶': { carbRatio: 0.05, proteinRatio: 0.036, unitWeight: 250 } // 每盒250ml
  }
};

function App() {
  const [userData, setUserData] = useState({
    gender: '男',
    height: '',
    weight: '',
    age: '',
    exerciseLevel: '新手',
    hasTraining: false,
    aerobicExpenditureTraining: '0',
    trainingCarbs: '2.6',
    trainingProtein: '1.4',
    restCarbs: '2.0',
    restProtein: '1.4',
  });
  
  const [calculations, setCalculations] = useState(null);
  const [baseCalculations, setBaseCalculations] = useState(null);
  const [mealDistribution, setMealDistribution] = useState(null);
  const [activeTab, setActiveTab] = useState('training');
  const [showResults, setShowResults] = useState(false);

  const calculateBMI = (weight, height) => {
    return (weight / ((height / 100) * (height / 100))).toFixed(1);
  };

  const calculateBase = () => {
    const { gender, height, weight, age, aerobicExpenditureTraining } = userData;
    let bmr;
    if (gender === '男') {
      bmr = (9.99 * weight) + (6.25 * height) - (4.92 * age) + 5;
    } else {
      bmr = (9.99 * weight) + (6.25 * height) - (4.92 * age) - 161;
    }

    const trainingCalories = userData.exerciseLevel === '新手' ? 150 :
        userData.exerciseLevel === '有基础' ? 200 : 250;
    const aerobicExpenditure = parseFloat(aerobicExpenditureTraining) || 0;

    const noExerciseTotal = Math.round(bmr / 0.7);
    const trainingDayTotal = (noExerciseTotal + trainingCalories + aerobicExpenditure) * 0.64;
    const restDayTotal = (noExerciseTotal + aerobicExpenditure) * 0.64;

    setBaseCalculations({
      bmi: calculateBMI(weight, height),
      bmr: Math.round(bmr),
      noExerciseTotal,
      trainingCalories,
      aerobicExpenditure,
      trainingDayTotal,
      restDayTotal
    });
    setShowResults(true);
  };

  const calculateFat = (gender, weight) => {
    if (gender === '男') {
      return weight > 120 ? 70 : 60;
    }
    return 50;
  };

  const calculateMealDistribution = (totalCarbs, totalProtein, isTrainingDay) => {
    const ratios = isTrainingDay ? MEAL_RATIOS.training : MEAL_RATIOS.rest;
    const meals = {};

    for (const [mealName, ratio] of Object.entries(ratios)) {
      const carbsAmount = Math.round(totalCarbs * ratio.carbs);
      const proteinAmount = Math.round(totalProtein * ratio.protein);

      // 计算推荐食物量
      const recommendedFood = {
        carbs: {
          rice: Math.round((carbsAmount / FOOD_DATABASE.主食['米饭(一般)'].carbRatio)),
          noodles: Math.round((carbsAmount / FOOD_DATABASE.主食['面条(熟)'].carbRatio))
        },
        protein: {
          chicken: Math.round(proteinAmount / FOOD_DATABASE.蛋白质['瘦肉(熟)'].proteinRatio),
          eggs: Math.ceil(proteinAmount / (FOOD_DATABASE.蛋白质['鸡蛋'].proteinRatio * FOOD_DATABASE.蛋白质['鸡蛋'].unitWeight))
        }
      };

      meals[mealName] = {
        carbs: carbsAmount,
        protein: proteinAmount,
        recommendedFood
      };
    }

    return meals;
  };

  const handleCalculate = () => {
    const { gender, weight, trainingCarbs, trainingProtein, restCarbs, restProtein } = userData;
    
    if (baseCalculations) {
      const fatAmount = calculateFat(gender, parseFloat(weight));
      
      // 计算训练日总量
      const trainingTotalCarbs = Math.round(parseFloat(trainingCarbs) * parseFloat(weight));
      const trainingTotalProtein = Math.round(parseFloat(trainingProtein) * parseFloat(weight));
      
      // 计算休息日总量 - 碳水减去练后餐的量，蛋白质保持不变
      const restTotalCarbs = Math.round(parseFloat(restCarbs) * parseFloat(weight));
      const restTotalProtein = trainingTotalProtein; // 休息日蛋白质总量与训练日相同

      const calculations = {
        ...baseCalculations,
        nutrition: {
          training: {
            carbs: trainingTotalCarbs,
            protein: trainingTotalProtein
          },
          rest: {
            carbs: restTotalCarbs,
            protein: restTotalProtein
          },
          fat: fatAmount
        }
      };

      // 计算餐食分配
      const trainingDayMeals = calculateMealDistribution(
        calculations.nutrition.training.carbs,
        calculations.nutrition.training.protein,
        true
      );

      const restDayMeals = calculateMealDistribution(
        calculations.nutrition.rest.carbs,
        calculations.nutrition.rest.protein,
        false
      );

      setCalculations(calculations);
      setMealDistribution({
        training: trainingDayMeals,
        rest: restDayMeals,
      });
      setShowResults(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="app-container">
      <div className="input-section">
        <h1 className="app-title">营养计算器</h1>
        <div className="input-container">
          <div>
            <label>性别:</label>
            <select name="gender" value={userData.gender} onChange={handleInputChange}>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div>
            <label>年龄:</label>
            <input
              type="number"
              name="age"
              value={userData.age}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>身高 (cm):</label>
            <input
                type="number"
                name="height"
                value={userData.height}
                onChange={handleInputChange}
            />
          </div>
          <div>
            <label>体重 (kg):</label>
            <input
                type="number"
                name="weight"
                value={userData.weight}
                onChange={handleInputChange}
            />
          </div>
          <div>
            <label>训练水平:</label>
            <select name="exerciseLevel" value={userData.exerciseLevel} onChange={handleInputChange}>
              <option value="新手">新手</option>
              <option value="有基础">有基础</option>
              <option value="老手">老手</option>
            </select>
          </div>
          <div>
            <label>是否训练日:</label>
            <input
                type="checkbox"
                name="hasTraining"
                checked={userData.hasTraining}
                onChange={handleInputChange}
            />
          </div>
          <div>
            <label>有氧消耗 (卡路里):</label>
            <input
              type="number"
              name="aerobicExpenditureTraining"
              value={userData.aerobicExpenditureTraining}
              onChange={handleInputChange}
              placeholder="0"
            />
          </div>
          <div className="button-group">
            <button className="calculate-button" onClick={calculateBase}>计算基础数据</button>
          </div>
        </div>

        {baseCalculations && (
          <div className="nutrition-inputs">
            <h3>训练日系数</h3>
            <div className="input-group">
              <input
                type="number"
                name="trainingCarbs"
                value={userData.trainingCarbs}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                placeholder="碳水系数(g/kg)"
              />
              <input
                type="number"
                name="trainingProtein"
                value={userData.trainingProtein}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                placeholder="蛋白质系数(g/kg)"
              />
            </div>

            <h3>休息日系数</h3>
            <div className="input-group">
              <input
                type="number"
                name="restCarbs"
                value={userData.restCarbs}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                placeholder="碳水系数(g/kg)"
              />
              <input
                type="number"
                name="restProtein"
                value={userData.restProtein}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                placeholder="蛋白质系数(g/kg)"
              />
            </div>

            <div className="button-group">
              <button className="calculate-button" onClick={handleCalculate}>计算营养总量</button>
            </div>
          </div>
        )}
      </div>

      {showResults && (
        <>
          <div className="overlay" onClick={() => setShowResults(false)} />
          <div className="meal-results">
            <button 
              className="close-results" 
              onClick={() => setShowResults(false)}
            >
              ×
            </button>
            
            <div className="base-results">
              <h2>基础计算结果</h2>
              <div className="result-item">
                <p>BMI: {baseCalculations.bmi}</p>
                <p>基础代谢: {baseCalculations.bmr} 卡路里</p>
                <p>无运动总消耗: {baseCalculations.noExerciseTotal} 卡路里</p>
                <p>力量训练消耗: {baseCalculations.trainingCalories} 卡路里</p>
                <p>有氧运动消耗: {baseCalculations.aerobicExpenditure} 卡路里</p>
                <p>训练日总热量: {Math.round(baseCalculations.trainingDayTotal)} 卡路里</p>
                <p>休息日总热量: {Math.round(baseCalculations.restDayTotal)} 卡路里</p>
              </div>
            </div>

            {mealDistribution && (
              <>
                <div className="tabs">
                  <button 
                    className={`tab-button ${activeTab === 'training' ? 'active' : ''}`}
                    onClick={() => setActiveTab('training')}
                  >
                    训练日
                  </button>
                  <button 
                    className={`tab-button ${activeTab === 'rest' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rest')}
                  >
                    休息日
                  </button>
                </div>
                <div className="tab-content">
                  <div className="meals-container">
                    {Object.entries(mealDistribution[activeTab]).map(([meal, data]) => (
                      <div key={meal} className="meal-card">
                        <div className="meal-header">
                          <h3>{getMealName(meal)}</h3>
                        </div>
                        <div className="macro-targets">
                          <div className="macro-item">
                            <span className="macro-label">目标碳水</span>
                            <span className="macro-value">{data.carbs}g</span>
                          </div>
                          <div className="macro-item">
                            <span className="macro-label">目标蛋白质</span>
                            <span className="macro-value">{data.protein}g</span>
                          </div>
                        </div>
                        <div className="food-recommendations">
                          <div className="food-section">
                            <h4>主食推荐</h4>
                            {Object.entries(FOOD_DATABASE.主食).map(([name, ratios]) => {
                              const weight = Math.round(data.carbs / ratios.carbRatio);
                              const actualCarbs = Math.round(weight * ratios.carbRatio);
                              return (
                                <div key={name} className="food-item">
                                  <span className="food-name">{name}</span>
                                  <span className="food-details">
                                    {weight}g ({ratios.carbRatio * 100}% 碳水)
                                    = {actualCarbs}g 碳水
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="food-section">
                            <h4>蛋白质来源</h4>
                            {Object.entries(FOOD_DATABASE.蛋白质).map(([name, ratios]) => {
                              const weight = ratios.unitWeight 
                                ? Math.ceil(data.protein / (ratios.proteinRatio * ratios.unitWeight)) 
                                : Math.round(data.protein / ratios.proteinRatio);
                              const actualProtein = ratios.unitWeight
                                ? Math.round(weight * ratios.unitWeight * ratios.proteinRatio)
                                : Math.round(weight * ratios.proteinRatio);
                              return (
                                <div key={name} className="food-item">
                                  <span className="food-name">{name}</span>
                                  <span className="food-details">
                                    {ratios.unitWeight 
                                      ? `${weight}份 (每份${ratios.unitWeight}g)`
                                      : `${weight}g`} 
                                    ({ratios.proteinRatio * 100}% 蛋白)
                                    = {actualProtein}g 蛋白质
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function getMealName(meal) {
  const mealNames = {
    breakfast: '早餐（练前餐）',
    postWorkout: '练后餐',
    lunch: '午餐',
    dinner: '晚餐',
    snacks: '零食/夜宵'
  };
  return mealNames[meal] || meal;
}

// 添加新的样式
const styles = `
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #f0f2f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-section {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-title {
  text-align: center;
  color: #1a237e;
  margin-bottom: 2rem;
}

.input-container {
  width: 100%;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  text-align: center;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.meal-results {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1000;
  text-align: center;
}

.base-results {
  background: #e3f2fd;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  text-align: center;
}

.base-results h2 {
  color: #1a237e;
  margin-bottom: 1.5rem;
}

.result-item p {
  margin: 0.8rem 0;
  font-size: 1.1rem;
  color: #333;
}

.tabs {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
  gap: 1rem;
}

.tab-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  color: #666;
  min-width: 120px;
}

.tab-button.active {
  background: #1a237e;
  color: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.meals-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  justify-content: center;
  text-align: center;
}

.meal-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
  height: fit-content;
}

.meal-header {
  background: #e3f2fd;
  color: #1a237e;
  padding: 1.5rem;
  text-align: center;
}

.meal-header h3 {
  margin: 0;
  font-size: 1.3rem;
}

.macro-targets {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
  background: #e8eaf6;
  text-align: center;
}

.macro-item {
  margin: 0 1.5rem;
  text-align: center;
}

.macro-label {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.macro-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: #1a237e;
}

.food-recommendations {
  padding: 1.5rem;
  background: #f0f4c3;
  text-align: center;
}

.food-section {
  margin-bottom: 2rem;
  text-align: center;
}

.food-section h4 {
  color: #1a237e;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e8eaf6;
  text-align: center;
}

.food-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.8rem;
  background: #ffffff;
  border-radius: 8px;
  text-align: center;
}

.food-name {
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
}

.food-details {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  text-align: center;
}

.button-group {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.calculate-button {
  padding: 1rem 2rem;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.calculate-button:hover {
  background: #3949ab;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.close-results {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-results:hover {
  background: #3949ab;
  transform: rotate(90deg);
}

.nutrition-inputs {
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
}

.nutrition-inputs h3 {
  color: #1a237e;
  margin-bottom: 1rem;
  text-align: center;
}

.input-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.input-group input {
  width: 150px;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
}

@media (max-width: 768px) {
  .meals-container {
    grid-template-columns: 1fr;
  }
  
  .meal-card {
    max-width: 100%;
  }
}
`;

export default App;