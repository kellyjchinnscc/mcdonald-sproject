fetch(`https://api.nal.usda.gov/fdc/v1/foods/list?api_key=2E3KnM9aEwbOJQojLjSlUXpJa0ePATpbeTh62KV6&query=mcdonald&pageSize=20`)
.then(function(response){return response.json()})
.then(function(json)
{
    // DATA GRABBING AND API MANIPULATION 
    let foodWithNutritionArray = json.map(function(currentFoodItem) // getting each food's name AND each of its unfiltered nutrition arrays
    {
        let tempInnerNutrientsArray = currentFoodItem.foodNutrients
        let tempObject = {};
        tempObject.foodName = currentFoodItem.description;
        tempObject.nutritionInfo = tempInnerNutrientsArray;
        return tempObject;
    }) // THIS WAS JUST A HELPER BLOCK TO NARROW DOWN FILTERING - COULD'VE EASILY DONE WITHOUT IT

    let foodsWithMacrosArray = foodWithNutritionArray.map(function(currentFoodItem) // accessing each food in the array
    {
        let tempObject = {};
        tempObject.name = currentFoodItem.foodName;
        let currentFoodNutrition = currentFoodItem.nutritionInfo; // getting each nutritionInfo array and storing the array into a variable
        let filteredNutritionArray = currentFoodNutrition.filter(function(currentNutrient) // filtering out for Carbs, Proteins and Fats
        {
            if(currentNutrient.name === "Protein" || currentNutrient.name === "Carbohydrate, by difference" || currentNutrient.name === "Total lipid (fat)" || currentNutrient.unitName === "KCAL") // Grabbing Carbs Proteins and Fats
            {
                if(currentNutrient.name === "Carbohydrate, by difference") // simplifying to Carb
                {
                    currentNutrient.name = "Carb"
                }
                else if(currentNutrient.name === "Total lipid (fat)") // simplifying to Fat
                {
                    currentNutrient.name = "Fat"
                }
                return currentNutrient
            }
        })
        
        tempObject.macros = filteredNutritionArray;
        return tempObject;
    })
    
    foodsWithMacrosArray.forEach(function(currentFood) // formatting each food name to a standard
    {
        currentFood.name = currentFood.name.slice(12) // getting rid of the "McDONALD'S" portion of the food name
        currentFood.name = currentFood.name.toUpperCase(); // capitalizing each food name
    })
    console.log(foodsWithMacrosArray)

// DOM MANIPULATION

    let mainDisplay = document.getElementById('mainArea')
    
    for(let i = 0; i < foodsWithMacrosArray.length; i++)
    {
        let individualFood = document.createElement('div')
        let domFoodName = document.createElement('span')
        domFoodName.innerHTML = foodsWithMacrosArray[i].name;
        domFoodName.style.textDecoration = "underline"
        domFoodName.style.fontWeight = "bold"
        individualFood.className = "foodItem"
        mainDisplay.appendChild(individualFood);
        individualFood.appendChild(domFoodName)
        individualFood.addEventListener('mouseenter', function(e)
        {
            individualFood.style.backgroundColor = "whitesmoke"
            let nutritionLabel = document.createElement('p')
            let nutritionLabelHtml = ""
            for(j = 0; j < 4; j++)
            {
                if(foodsWithMacrosArray[i].macros[j].name === "Carb")
                {
                    nutritionLabelHtml += `Carbs: ${foodsWithMacrosArray[i].macros[j].amount}g <br>`
                }
                else if(foodsWithMacrosArray[i].macros[j].name === "Protein")
                {
                    nutritionLabelHtml += `Protein: ${foodsWithMacrosArray[i].macros[j].amount}g <br>`
                }
                else if(foodsWithMacrosArray[i].macros[j].name === "Fat")
                {
                    nutritionLabelHtml += `Fat: ${foodsWithMacrosArray[i].macros[j].amount}g <br>`
                }
                else if(foodsWithMacrosArray[i].macros[j].name === "Energy")
                {
                    nutritionLabelHtml += `Cals: ${foodsWithMacrosArray[i].macros[j].amount}kCal<br>`
                }
            }
            nutritionLabel.style.fontSize = "12px"
            nutritionLabel.innerHTML = nutritionLabelHtml;        
            individualFood.appendChild(nutritionLabel)
            individualFood.addEventListener('mouseleave', function(e)
            {
                individualFood.style.backgroundColor = "yellowgreen"
                // individualFood.removeChild(nutritionLabel)
                nutritionLabel.innerHTML = ""
            })
        })
    }

    // GENERATING BAR CHART AND USING D3

    // Getting each food name and their respective calories 
    let foodWithCalories = foodsWithMacrosArray.map(function(currentFood)
    {
        tempObj = {};
        tempObj.foodName = currentFood.name
        tempMacrosArray = currentFood.macros;
        tempObj.numCals = tempMacrosArray.filter(function(currentFoodMacros)
        {
            if(currentFoodMacros.name === "Energy")
            {
                return currentFoodMacros.amount;
            }
        })
        tempObj.numCals = tempObj.numCals[0]['amount'];
        return tempObj;
    })
    console.log(foodWithCalories);
    let justCals = foodWithCalories.map(function(currentFood)
    {
        return currentFood.numCals;
    });

    let justNames = foodWithCalories.map(function(currentFood)
    {
        return currentFood.foodName;
    });

    justCals.unshift('Calories');
    var chart = c3.generate
    ({
        bindto: '#myChart',
        data: 
        {
          columns: 
          [
            justCals
          ],
          type: "bar"
        },
        axis: {
            x: {
                type: 'category',
                categories: justNames
            }
        }
    });
})