import React from 'react';
import { X, Info, Leaf, Heart, Sprout } from 'lucide-react';

interface NutritionalFactsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NutritionLabel: React.FC<{ 
  title: string; 
  servingSize: string; 
  servings: number;
  calories: number;
  totalFat: number;
  saturatedFat: number;
  transFat: number;
  cholesterol: number;
  sodium: number;
  totalCarbs: number;
  fiber: number;
  totalSugars: number;
  addedSugars?: number;
  protein: number;
  vitaminD?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
  isAllulose?: boolean;
}> = ({
  title,
  servingSize,
  servings,
  calories,
  totalFat,
  saturatedFat,
  transFat,
  cholesterol,
  sodium,
  totalCarbs,
  fiber,
  totalSugars,
  addedSugars,
  protein,
  vitaminD,
  calcium,
  iron,
  potassium,
  isAllulose = false
}) => {
  return (
    <div className="bg-white border-2 border-black p-4 max-w-xs mx-auto">
      {/* Header */}
      <div className="border-b-8 border-black pb-2 mb-2">
        <h3 className="text-2xl font-bold leading-tight">{title}</h3>
      </div>
      
      {/* Serving Size */}
      <div className="border-b border-black pb-1 mb-1">
        <div className="flex justify-between items-baseline">
          <span className="font-bold text-lg">Serving size</span>
          <span className="font-bold text-lg">{servingSize}</span>
        </div>
        <div className="text-right mt-1">
          <span className="text-sm">Servings: {servings}</span>
        </div>
      </div>

      {/* Calories */}
      <div className="border-b-4 border-black py-2 mb-1">
        <div className="flex justify-between items-baseline">
          <span className="font-bold text-xl">Calories</span>
          <span className="font-bold text-3xl">{calories}</span>
        </div>
      </div>

      {/* Daily Value */}
      <div className="text-right text-xs font-bold border-b border-black pb-1 mb-1">
        % Daily Value*
      </div>

      {/* Total Fat */}
      <div className="border-b border-black py-1">
        <div className="flex justify-between">
          <span className="font-bold">Total Fat</span>
          <span className="font-bold">{totalFat}g</span>
        </div>
        <div className="flex justify-between pl-4">
          <span>Saturated Fat</span>
          <span>{saturatedFat}g</span>
        </div>
        {transFat > 0 && (
          <div className="flex justify-between pl-4">
            <span>Trans Fat</span>
            <span>{transFat}g</span>
          </div>
        )}
      </div>

      {/* Cholesterol */}
      <div className="border-b border-black py-1">
        <div className="flex justify-between">
          <span className="font-bold">Cholesterol</span>
          <span className="font-bold">{cholesterol}mg</span>
        </div>
      </div>

      {/* Sodium */}
      <div className="border-b border-black py-1">
        <div className="flex justify-between">
          <span className="font-bold">Sodium</span>
          <span className="font-bold">{sodium}mg</span>
        </div>
      </div>

      {/* Total Carbohydrate */}
      <div className="border-b border-black py-1">
        <div className="flex justify-between">
          <span className="font-bold">Total Carbohydrate</span>
          <span className="font-bold">{totalCarbs}g</span>
        </div>
        <div className="flex justify-between pl-4">
          <span>Dietary Fiber</span>
          <span>{fiber}g</span>
        </div>
        <div className="flex justify-between pl-4">
          <span>Total Sugars</span>
          <span>{totalSugars}g</span>
        </div>
        {addedSugars !== undefined && (
          <div className="flex justify-between pl-4 font-bold">
            <span>Includes {isAllulose ? 'Allulose' : 'Added Sugars'}</span>
            <span>{addedSugars}g</span>
          </div>
        )}
      </div>

      {/* Protein */}
      <div className="border-b-4 border-black py-1 mb-1">
        <div className="flex justify-between">
          <span className="font-bold">Protein</span>
          <span className="font-bold">{protein}g</span>
        </div>
      </div>

      {/* Vitamins and Minerals */}
      {vitaminD !== undefined && (
        <div className="border-b border-black py-1">
          <div className="flex justify-between">
            <span>Vitamin D</span>
            <span>{vitaminD}mcg</span>
          </div>
        </div>
      )}
      {calcium !== undefined && (
        <div className="border-b border-black py-1">
          <div className="flex justify-between">
            <span>Calcium</span>
            <span>{calcium}mg</span>
          </div>
        </div>
      )}
      {iron !== undefined && (
        <div className="border-b border-black py-1">
          <div className="flex justify-between">
            <span>Iron</span>
            <span>{iron}mg</span>
          </div>
        </div>
      )}
      {potassium !== undefined && (
        <div className="border-b border-black py-1">
          <div className="flex justify-between">
            <span>Potassium</span>
            <span>{potassium}mg</span>
          </div>
        </div>
      )}

      {/* Footnote */}
      <div className="text-xs mt-2 leading-tight">
        * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 
        2,000 calories a day is used for general nutrition advice.
      </div>
    </div>
  );
};

const NutritionalFacts: React.FC<NutritionalFactsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative bg-gray-100 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border-4 border-yellow-400">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-200 rounded-full p-2 transition-all duration-200 hover:scale-110 shadow-lg border-2 border-black"
        >
          <X className="w-5 h-5 text-gray-800" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-yellow-400 to-pink-500 p-4 rounded-full">
                <Info className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-pink-500">
                Nutrition Facts
              </span>
            </h2>
            <p className="text-gray-600">Ice Cream Base - Per Serving (150 ml)</p>
            <p className="text-sm text-gray-500 mt-2">Perfect for nutritionists and dietary planning</p>
          </div>

          {/* Nutrition Labels */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* Traditional Sweet Base */}
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-pink-100 p-2 rounded-full">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Traditional Sweet Base</h3>
              </div>
              <NutritionLabel
                title="Traditional Ice Cream Base"
                servingSize="150 ml"
                servings={1}
                calories={520}
                totalFat={33}
                saturatedFat={20}
                transFat={0}
                cholesterol={195}
                sodium={105}
                totalCarbs={48}
                fiber={0}
                totalSugars={44}
                addedSugars={44}
                protein={7}
                vitaminD={1.2}
                calcium={140}
                iron={0.5}
                potassium={210}
              />
            </div>

            {/* Allulose Base */}
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Allulose Base (Sugar-Free)</h3>
              </div>
              <NutritionLabel
                title="Allulose Ice Cream Base"
                servingSize="150 ml"
                servings={1}
                calories={375}
                totalFat={33}
                saturatedFat={20}
                transFat={0}
                cholesterol={195}
                sodium={105}
                totalCarbs={5}
                fiber={0}
                totalSugars={0}
                addedSugars={0}
                protein={7}
                vitaminD={1.2}
                calcium={140}
                iron={0.5}
                potassium={210}
                isAllulose={true}
              />
            </div>

            {/* Vegan Coconut Cream Base */}
            <div className="flex flex-col items-center md:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Sprout className="w-6 h-6 text-amber-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Vegan Coconut Cream Base</h3>
              </div>
              <NutritionLabel
                title="Vegan Ice Cream Base"
                servingSize="150 ml"
                servings={1}
                calories={450}
                totalFat={36}
                saturatedFat={32}
                transFat={0}
                cholesterol={0}
                sodium={20}
                totalCarbs={34}
                fiber={0}
                totalSugars={28}
                addedSugars={28}
                protein={3}
                calcium={25}
                iron={0.9}
                potassium={260}
              />
              <p className="text-xs text-gray-500 text-center max-w-xs mt-3">
                Label assumes coconut cream with granulated sugar; fructose, allulose, or other sweeteners change sugars and calories—ask staff or recalculate for your choice.
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gradient-to-r from-yellow-50 to-pink-50 rounded-xl p-6 border border-yellow-200">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
              <Info className="w-5 h-5 text-yellow-600" />
              <span>Important Notes for Nutritionists</span>
            </h4>
            <ul className="text-gray-700 text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>
                <strong>Traditional Base:</strong> Contains 44g of added sugars per 150ml serving from sugar and fructose. 
                Total carbohydrate content is 48g per serving. Calculated from: 384 oz heavy cream, 64 oz egg yolks, 
                9 cups sugar, and 2L fructose.
              </li>
              <li>
                <strong>Allulose Base:</strong> Sugar-free option with minimal carbohydrates (5g per 150ml serving). 
                Allulose is a low-calorie sweetener that has minimal impact on blood sugar levels and is suitable 
                for keto and diabetic diets. Calculated from: 64 oz heavy cream, 16 oz egg yolks, and 2 cups allulose.
              </li>
              <li>
                <strong>Vegan Base:</strong> Dairy-free and egg-free—coconut cream, sweetener of choice, and cornstarch. The sample label uses granulated sugar; values vary by coconut cream brand and sweetener.
              </li>
              <li>
                Traditional and allulose dairy bases share the same cream and egg yolk profile; the difference is mainly the sweetener. The vegan base uses coconut cream instead of dairy and has no cholesterol.
              </li>
              <li>
                Values are calculated for the base only. Actual nutritional content may vary based on added flavors 
                and toppings. For complete nutritional information, please account for additional ingredients in 
                specific menu items.
              </li>
              <li>
                Allulose contributes approximately 0.4 calories per gram compared to 4 calories per gram for 
                traditional sugars, making it an excellent option for reduced-calorie diets.
              </li>
            </ul>
          </div>

          {/* Close Button at Bottom */}
          <div className="mt-8 text-center">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-bold py-3 px-8 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-2 border-black"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NutritionalFacts;
