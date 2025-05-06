
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "./ui/date-picker"; // Changed to relative path
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay } from 'date-fns';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress"; // Import Progress component

// Types
interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  id: string;
  name: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  foods: FoodItem[];
}

interface DailyLog {
  date: string; // YYYY-MM-DD format for easy storage/lookup
  meals: Meal[];
}

type FitnessGoal = 'Lose Weight' | 'Gain Weight' | 'Maintain';

interface DailyGoals {
    calories: number;
    protein: number; // grams
    carbs: number;   // grams
    fat: number;      // grams
}

// Base goals (adjust these as needed)
const BASE_GOALS: DailyGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65
};

// Goal adjustments
const GOAL_ADJUSTMENTS: Record<FitnessGoal, Partial<DailyGoals>> = {
    'Lose Weight': { calories: BASE_GOALS.calories - 300 }, // Example: 300 calorie deficit
    'Gain Weight': { calories: BASE_GOALS.calories + 300 }, // Example: 300 calorie surplus
    'Maintain': {} // No adjustment needed
};


// Local Storage Helpers
const STORAGE_KEY = 'nutritionLog';
const PROFILE_STORAGE_KEY = 'profileData';

const getStoredNutritionLog = (): Record<string, DailyLog> => {
  if (typeof window === 'undefined') return {}; // Avoid localStorage errors during SSR
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error parsing nutrition log from localStorage:", error);
    return {};
  }
};

const saveStoredNutritionLog = (log: Record<string, DailyLog>) => {
   if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
};

// Helper to get fitness goal
const getStoredFitnessGoal = (): FitnessGoal => {
   if (typeof window === 'undefined') return 'Maintain';
    try {
        const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (storedProfile) {
            const profileData = JSON.parse(storedProfile);
            const goal = profileData.fitnessGoal;
            if (goal === 'Lose Weight' || goal === 'Gain Weight' || goal === 'Maintain') {
                return goal;
            }
        }
    } catch (error) {
        console.error("Error reading fitness goal from localStorage:", error);
    }
    return 'Maintain'; // Default goal
};


const NutritionTracker: React.FC = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [allLogs, setAllLogs] = useState<Record<string, DailyLog>>({});
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('Maintain');

  // Form state
  const [mealName, setMealName] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'>('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

   // Load logs and fitness goal on mount
   useEffect(() => {
        setAllLogs(getStoredNutritionLog());
        setFitnessGoal(getStoredFitnessGoal());
    }, []);

  // Calculate daily goals based on fitness goal
  const DAILY_GOALS = useMemo(() => {
      const adjustments = GOAL_ADJUSTMENTS[fitnessGoal];
      return {
          ...BASE_GOALS,
          ...adjustments // Apply adjustments (e.g., modify calories)
      };
  }, [fitnessGoal]);

  // Get log for the selected date
  const selectedDateString = selectedDate ? format(startOfDay(selectedDate), 'yyyy-MM-dd') : '';
  const currentDayLog = allLogs[selectedDateString] || { date: selectedDateString, meals: [] };

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDateString || !foodName || !calories || !protein || !carbs || !fat) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill in all food details.' });
      return;
    }

    const foodItem: FoodItem = {
      id: crypto.randomUUID(),
      name: foodName,
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
    };

    if (foodItem.calories < 0 || foodItem.protein < 0 || foodItem.carbs < 0 || foodItem.fat < 0) {
        toast({ variant: 'destructive', title: 'Invalid Values', description: 'Nutrient values cannot be negative.' });
        return;
    }


    setAllLogs(prevLogs => {
      const updatedDayLog = { ...prevLogs[selectedDateString] } as DailyLog;

      if (!updatedDayLog.date) {
          updatedDayLog.date = selectedDateString;
          updatedDayLog.meals = [];
      }

      let mealIndex = updatedDayLog.meals.findIndex(m => m.name === mealName);

      if (mealIndex === -1) {
        // Add new meal if it doesn't exist for the day
        updatedDayLog.meals.push({ id: crypto.randomUUID(), name: mealName, foods: [foodItem] });
      } else {
        // Add food to existing meal
        updatedDayLog.meals[mealIndex].foods.push(foodItem);
      }

      const newLogs = { ...prevLogs, [selectedDateString]: updatedDayLog };
      saveStoredNutritionLog(newLogs);
      return newLogs;
    });

    toast({ title: 'Food Added', description: `${foodName} added to ${mealName}.` });

    // Reset form
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    // setMealName('Breakfast'); // Optionally reset meal type
  };

  const handleDeleteFood = (mealId: string, foodId: string) => {
    if (!selectedDateString) return;

    setAllLogs(prevLogs => {
        const updatedDayLog = { ...prevLogs[selectedDateString] } as DailyLog;
        if (!updatedDayLog.meals) return prevLogs; // Should not happen, but safe check

        const mealIndex = updatedDayLog.meals.findIndex(m => m.id === mealId);
        if (mealIndex === -1) return prevLogs; // Meal not found

        // Filter out the food item
        updatedDayLog.meals[mealIndex].foods = updatedDayLog.meals[mealIndex].foods.filter(f => f.id !== foodId);

        // Optional: Remove meal if it becomes empty
        // if (updatedDayLog.meals[mealIndex].foods.length === 0) {
        //     updatedDayLog.meals.splice(mealIndex, 1);
        // }

        const newLogs = { ...prevLogs, [selectedDateString]: updatedDayLog };
        saveStoredNutritionLog(newLogs);
        toast({ title: 'Food Removed' });
        return newLogs;
    });
  }


  // Calculate daily totals
  const dailyTotals = useMemo(() => {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    currentDayLog.meals.forEach(meal => {
      meal.foods.forEach(food => {
        totals.calories += food.calories;
        totals.protein += food.protein;
        totals.carbs += food.carbs;
        totals.fat += food.fat;
      });
    });
    return totals;
  }, [currentDayLog]);

  // Calculate progress percentages using the dynamically set DAILY_GOALS
  const progressPercentages = useMemo(() => ({
      calories: DAILY_GOALS.calories > 0 ? Math.min((dailyTotals.calories / DAILY_GOALS.calories) * 100, 100) : 0,
      protein: DAILY_GOALS.protein > 0 ? Math.min((dailyTotals.protein / DAILY_GOALS.protein) * 100, 100) : 0,
      carbs: DAILY_GOALS.carbs > 0 ? Math.min((dailyTotals.carbs / DAILY_GOALS.carbs) * 100, 100) : 0,
      fat: DAILY_GOALS.fat > 0 ? Math.min((dailyTotals.fat / DAILY_GOALS.fat) * 100, 100) : 0,
  }), [dailyTotals, DAILY_GOALS]);

  const goalDescription = `Based on your goal to '${fitnessGoal}'. Goals: Calories: ${DAILY_GOALS.calories}kcal, Protein: ${DAILY_GOALS.protein}g, Carbs: ${DAILY_GOALS.carbs}g, Fat: ${DAILY_GOALS.fat}g`;


  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
          <CardDescription>View or add nutrition logs for a specific date.</CardDescription>
        </CardHeader>
        <CardContent>
          <DatePicker date={selectedDate} setDate={setSelectedDate} />
        </CardContent>
      </Card>

      {/* Add Food Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Food Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddFood} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="mealName">Meal</Label>
                 <Select value={mealName} onValueChange={(value: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks') => setMealName(value)}>
                    <SelectTrigger id="mealName">
                        <SelectValue placeholder="Select meal" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Breakfast">Breakfast</SelectItem>
                        <SelectItem value="Lunch">Lunch</SelectItem>
                        <SelectItem value="Dinner">Dinner</SelectItem>
                        <SelectItem value="Snacks">Snacks</SelectItem>
                    </SelectContent>
                 </Select>
               </div>
                <div className="space-y-2">
                  <Label htmlFor="foodName">Food Name</Label>
                  <Input id="foodName" value={foodName} onChange={e => setFoodName(e.target.value)} placeholder="e.g., Apple" />
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Calories (kcal)</Label>
                <Input id="calories" type="number" min="0" step="1" value={calories} onChange={e => setCalories(e.target.value)} placeholder="e.g., 95" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input id="protein" type="number" min="0" step="0.1" value={protein} onChange={e => setProtein(e.target.value)} placeholder="e.g., 0.5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input id="carbs" type="number" min="0" step="0.1" value={carbs} onChange={e => setCarbs(e.target.value)} placeholder="e.g., 25" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Fat (g)</Label>
                <Input id="fat" type="number" min="0" step="0.1" value={fat} onChange={e => setFat(e.target.value)} placeholder="e.g., 0.3" />
              </div>
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Food
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Daily Log Display */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Log for {selectedDate ? format(selectedDate, 'PPP') : '...'}</CardTitle>
          <CardDescription>Summary of your meals and progress towards daily goals.</CardDescription>
        </CardHeader>
        <CardContent>
          {currentDayLog.meals.length === 0 && dailyTotals.calories === 0 ? (
            <p className="text-center text-muted-foreground">No meals logged for this day yet.</p>
          ) : (
            <div className="space-y-6">
               {/* Daily Progress Bars */}
               <Card className="bg-muted/50">
                   <CardHeader className="pb-2">
                       <CardTitle className="text-lg">Daily Progress</CardTitle>
                       {/* Display the dynamically calculated goals */}
                       <CardDescription>{goalDescription}</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-3 pt-2">
                       {/* Calories */}
                       <div>
                           <div className="flex justify-between text-sm mb-1">
                               <span className="font-medium">Calories</span>
                               <span className="text-muted-foreground">{dailyTotals.calories.toFixed(0)} / {DAILY_GOALS.calories} kcal</span>
                           </div>
                           <Progress value={progressPercentages.calories} className="h-2" />
                       </div>
                       {/* Protein */}
                       <div>
                           <div className="flex justify-between text-sm mb-1">
                               <span className="font-medium">Protein</span>
                               <span className="text-muted-foreground">{dailyTotals.protein.toFixed(1)} / {DAILY_GOALS.protein} g</span>
                           </div>
                           <Progress value={progressPercentages.protein} className="h-2" />
                       </div>
                       {/* Carbs */}
                       <div>
                           <div className="flex justify-between text-sm mb-1">
                               <span className="font-medium">Carbohydrates</span>
                               <span className="text-muted-foreground">{dailyTotals.carbs.toFixed(1)} / {DAILY_GOALS.carbs} g</span>
                           </div>
                           <Progress value={progressPercentages.carbs} className="h-2" />
                       </div>
                       {/* Fat */}
                       <div>
                           <div className="flex justify-between text-sm mb-1">
                               <span className="font-medium">Fat</span>
                               <span className="text-muted-foreground">{dailyTotals.fat.toFixed(1)} / {DAILY_GOALS.fat} g</span>
                           </div>
                           <Progress value={progressPercentages.fat} className="h-2" />
                       </div>
                   </CardContent>
               </Card>


              <Separator />

              {/* Meal Breakdown */}
              <h3 className="text-md font-semibold pt-2">Meal Details</h3>
              <ScrollArea className="h-[300px] w-full">
                <div className="space-y-4 pr-4">
                  {currentDayLog.meals.map(meal => (
                    <div key={meal.id}>
                      <h4 className="text-md font-semibold mb-2 border-b pb-1">{meal.name}</h4>
                      {meal.foods.length === 0 ? (
                          <p className="text-xs text-muted-foreground pl-2">No items logged for this meal.</p>
                      ): (
                          <ul className="space-y-2 pl-2">
                            {meal.foods.map(food => (
                              <li key={food.id} className="flex justify-between items-center text-sm border-b border-dashed pb-1 last:border-0">
                                <div className="flex-1 mr-2">
                                  <span className="font-medium">{food.name}</span>: {food.calories.toFixed(0)}kcal
                                  <span className="text-xs text-muted-foreground ml-2">
                                      (P:{food.protein.toFixed(1)}g, C:{food.carbs.toFixed(1)}g, F:{food.fat.toFixed(1)}g)
                                  </span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteFood(meal.id, food.id)}>
                                  <Trash2 className="h-3 w-3" />
                                  <span className="sr-only">Delete {food.name}</span>
                                </Button>
                              </li>
                            ))}
                          </ul>
                      )}
                    </div>
                  ))}
                    {currentDayLog.meals.length === 0 && dailyTotals.calories > 0 && (
                        <p className="text-center text-muted-foreground">No meals specified, but totals exist.</p>
                    )}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionTracker;
    
    