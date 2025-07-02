// frontend/src/components/bookings/MealPlanCard.jsx
import React from 'react';
import { MENU_DATA } from '../../constants/menu'; // Assumes specific plans

const MealPlanCard = ({ mealType, selectedPlan, onPlanChange }) => {
    const planNamesForMeal = MENU_DATA[mealType]?.planNames || [];
    const items = selectedPlan.plan && selectedPlan.plan !== 'None' 
        ? MENU_DATA[mealType]?.options?.[selectedPlan.plan] || [] 
        : [];
    return (
        <div className="border bg-gray-50 rounded-lg p-4 shadow-sm h-full flex flex-col">
            <h4 className="font-semibold text-gray-800">{mealType}</h4>
            <div className="mt-2"><label className="text-xs text-gray-600">Choose a Plan</label>
                <select name="plan" value={selectedPlan.plan} onChange={(e) => onPlanChange(mealType, e.target.name, e.target.value)} className="mt-1 block w-full bg-white pl-3 pr-8 py-2 text-sm border-gray-300 rounded-md shadow-sm">
                    {planNamesForMeal.map(plan => <option key={plan} value={plan}>{plan}</option>)}
                </select>
            </div>
            {items.length > 0 && (<div className="mt-4 border-t pt-3 flex-grow"><p className="text-xs font-bold text-gray-700 mb-2">Menu Includes:</p><ul className="space-y-1">{items.map(item => <li key={item} className="text-xs text-gray-600 ml-4 list-disc">{item}</li>)}</ul></div>)}
        </div>
    );
};
export default MealPlanCard;