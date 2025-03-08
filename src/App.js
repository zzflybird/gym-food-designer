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

function App() {
  const [userData, setUserData] = useState({
    gender: '男',
    height: '',
    weight: '',
    age: '',
    exerciseLevel: '新手',
    hasTraining: false,
    trainingCarbs: '2.6',
    trainingProtein: '1.4',
    restCarbs: '2.0',
    restProtein: '1.4',
  });
  
  const [calculations, setCalculations] = useState(null);
  const [baseCalculations, setBaseCalculations] = useState(null);

  const calculateBMI = (weight, height) => {
    return (weight / ((height / 100) * (height / 100))).toFixed(1);
  };

  const calculateBase = () => {
    const { gender, height, weight, age } = userData;
    let bmr;
    if (gender === '男') {
      bmr = (9.99 * weight) + (6.25 * height) - (4.92 * age) + 5;
    } else {
      bmr = (9.99 * weight) + (6.25 * height) - (4.92 * age) - 161;
    }

    const trainingCalories = userData.exerciseLevel === '新手' ? 150 :
        userData.exerciseLevel === '有基础' ? 200 : 250;

    const noExerciseTotal = Math.round(bmr * 0.7);
    const trainingDayTotal = Math.round(bmr * 0.7 + trainingCalories);
    const restDayTotal = noExerciseTotal;

    setBaseCalculations({
      bmi: calculateBMI(weight, height),
      bmr: Math.round(bmr),
      noExerciseTotal,
      trainingCalories,
      trainingDayTotal,
      restDayTotal
    });
  };

  const calculateFat = (gender, weight) => {
    if (gender === '男') {
      return weight > 120 ? 70 : 60;
    }
    return 50;
  };

  const handleCalculate = () => {
    const { gender, weight, trainingCarbs, trainingProtein, restCarbs, restProtein } = userData;
    
    if (baseCalculations) {
      const fatAmount = calculateFat(gender, parseFloat(weight));
      
      setCalculations({
        ...baseCalculations,
        nutrition: {
          training: {
            carbs: Math.round(parseFloat(trainingCarbs) * parseFloat(weight)),
            protein: Math.round(parseFloat(trainingProtein) * parseFloat(weight))
          },
          rest: {
            carbs: Math.round(parseFloat(restCarbs) * parseFloat(weight)),
            protein: Math.round(parseFloat(restProtein) * parseFloat(weight))
          },
          fat: fatAmount
        }
      });
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
    <div className="App">
      <h1>营养计算器</h1>
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
        <button onClick={calculateBase}>计算基础数据</button>
      </div>

      {baseCalculations && (
        <div className="base-results">
          <h2>基础计算结果</h2>
          <div className="result-item">
            <p>BMI: {baseCalculations.bmi}</p>
            <p>基础代谢: {baseCalculations.bmr} 卡路里</p>
            <p>无运动总消耗: {baseCalculations.noExerciseTotal} 卡路里</p>
            <p>训练消耗: {baseCalculations.trainingCalories} 卡路里</p>
            <p>训练日总热量: {baseCalculations.trainingDayTotal} 卡路里</p>
            <p>休息日总热量: {baseCalculations.restDayTotal} 卡路里</p>
          </div>

          <div className="nutrition-input">
            <h3>训练日系数</h3>
            <input
              type="number"
              name="trainingCarbs"
              placeholder="碳水系数(g/kg)"
              value={userData.trainingCarbs}
              onChange={handleInputChange}
              step="0.1"
            />
            <input
              type="number"
              name="trainingProtein"
              placeholder="蛋白质系数(g/kg)"
              value={userData.trainingProtein}
              onChange={handleInputChange}
              step="0.1"
            />

            <h3>休息日系数</h3>
            <input
              type="number"
              name="restCarbs"
              placeholder="碳水系数(g/kg)"
              value={userData.restCarbs}
              onChange={handleInputChange}
              step="0.1"
            />
            <input
              type="number"
              name="restProtein"
              placeholder="蛋白质系数(g/kg)"
              value={userData.restProtein}
              onChange={handleInputChange}
              step="0.1"
            />

            <button onClick={handleCalculate}>计算营养总量</button>
          </div>
        </div>
      )}

      {calculations && (
        <div className="final-results">
          <h2>最终营养配比</h2>
          <div className="result-item">
            <h3>训练日营养配比</h3>
            <p>碳水化合物: {calculations.nutrition.training.carbs}g ({userData.trainingCarbs}g/kg × {userData.weight}kg)</p>
            <p>蛋白质: {calculations.nutrition.training.protein}g ({userData.trainingProtein}g/kg × {userData.weight}kg)</p>
          </div>

          <div className="result-item">
            <h3>休息日营养配比</h3>
            <p>碳水化合物: {calculations.nutrition.rest.carbs}g ({userData.restCarbs}g/kg × {userData.weight}kg)</p>
            <p>蛋白质: {calculations.nutrition.rest.protein}g ({userData.restProtein}g/kg × {userData.weight}kg)</p>
          </div>

          <div className="result-item">
            <h3>每日脂肪摄入</h3>
            <p>脂肪: {calculations.nutrition.fat}g</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;