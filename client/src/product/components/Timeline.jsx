import React, { useState, useRef, useCallback } from "react";
import { productData } from "../lib/data";

const InfoCard = ({ label, value, icon }) => (
  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
    <span className="text-gray-700 text-sm font-medium flex items-center gap-2">
      <span>{icon}</span>
      {label}
    </span>
    <span className="text-gray-900 font-semibold text-xs bg-green-50 px-2 py-1 rounded border border-green-200">
      {value}
    </span>
  </div>
);

const StepButton = ({ stepNumber, isActive, icon, title, onClick, isCompleted }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center p-3 rounded-lg transition-all text-center min-w-20 ${
      isActive
        ? "bg-green-500 text-white shadow-lg scale-105"
        : isCompleted
        ? "bg-green-400 text-white shadow-md"
        : "bg-white text-gray-600 hover:bg-green-50 border border-gray-200 shadow-sm"
    }`}
  >
    <div className="text-xl mb-1">{icon}</div>
    <div className="text-xs font-bold">Step {stepNumber}</div>
    <div className="text-xs leading-tight">{title}</div>
  </button>
);

const useSwipe = (onSwipedLeft, onSwipedRight) => {
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e) => {
    touchEndRef.current = null;
    touchStartRef.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipedLeft) {
      onSwipedLeft();
    } else if (isRightSwipe && onSwipedRight) {
      onSwipedRight();
    }
  }, [onSwipedLeft, onSwipedRight]);

  return { onTouchStart, onTouchMove, onTouchEnd };
};

export default function Timeline({ data }) {
  const [activeStep, setActiveStep] = useState(0);
  const currentStep = data[activeStep];

  const nextStep = () => setActiveStep(prev => Math.min(data.length - 1, prev + 1));
  const prevStep = () => setActiveStep(prev => Math.max(0, prev - 1));

  const handleSwipeLeft = useCallback(() => {
    setActiveStep((prev) => Math.min(data.length - 1, prev + 1));
  }, [data.length]);

  const handleSwipeRight = useCallback(() => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  }, []);

  const swipeHandlers = useSwipe(handleSwipeLeft, handleSwipeRight);

  return (
    <div className="w-full p-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{productData.name} Journey</h1>
        <p className="text-gray-600 text-sm">Complete transparency from farm to table</p>
      </div>

      <div className="mb-8 hidden md:block">
        <div className="flex items-center justify-center overflow-x-auto pb-2">
          <div className="flex items-center gap-2 min-w-max">
            {data.map((step, index) => (
              <React.Fragment key={step.id}>
                <StepButton
                  stepNumber={index + 1}
                  isActive={activeStep === index}
                  isCompleted={index < activeStep}
                  icon={step.icon}
                  title={step.title}
                  onClick={() => setActiveStep(index)}
                />
                {index < data.length - 1 && (
                  <div className={`h-0.5 w-8 rounded ${index < activeStep ? "bg-green-400" : "bg-gray-300"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden" {...swipeHandlers}>
        <div className="bg-green-500 text-white p-5">
          <div className="flex items-center">
            <div className="text-2xl mr-4 bg-white/20 p-2 rounded-lg">{currentStep.icon}</div>
            <div>
              <h2 className="text-lg font-bold">Step {activeStep + 1}: {currentStep.title}</h2>
              <p className="text-green-100 text-sm">{currentStep.date} • {currentStep.location}</p>
            </div>
          </div>
        </div>

        <div className="p-5 bg-green-50/30">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              {Object.entries(currentStep.basicInfo).map(([label, value], idx) => {
                const icon = label.includes('Date') ? '📅' : 
                            label.includes('Location') ? '📍' : 
                            label.includes('Name') ? '👤' : '📋';
                return (
                  <InfoCard
                    key={idx}
                    label={label.replace(/📅|📍|👤/, '').trim()}
                    value={value}
                    icon={icon}
                  />
                );
              })}
            </div>

            <div className="space-y-3">
              {Object.entries(currentStep.detailedInfo).map(([label, value], idx) => {
                const icon = label.includes('Quantity') ? '📦' : 
                            label.includes('Price') || label.includes('Cost') ? '💰' : 
                            label.includes('Storage') || label.includes('Temperature') ? '🌡️' : 
                            label.includes('Hash') ? '🔗' : '📊';
                return (
                  <InfoCard
                    key={idx}
                    label={label.replace(/📦|💰|🌡️|🔗|📊/, '').trim()}
                    value={value}
                    icon={icon}
                  />
                );
              })}
            </div>
          </div>

          <div className="md:hidden text-center mt-4">
            <p className="text-gray-600 text-sm">← Swipe to navigate →</p>
          </div>

          <div className="hidden md:flex justify-between items-center mt-6">
            <button
              onClick={prevStep}
              disabled={activeStep === 0}
              className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              ← Previous
            </button>

            <div className="flex space-x-2">
              {data.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === activeStep ? "bg-green-500" : index < activeStep ? "bg-green-400" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextStep}
              disabled={activeStep === data.length - 1}
              className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Next →
            </button>
          </div>

          <div className="md:hidden flex justify-center items-center mt-4">
            <div className="flex space-x-2">
              {data.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === activeStep ? "bg-green-500" : index < activeStep ? "bg-green-400" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
