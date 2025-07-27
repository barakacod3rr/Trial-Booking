import React from 'react';

const ProgressBar = ({ currentStep, totalSteps, titles = [] }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={`progress-step ${
                    isCompleted
                      ? 'completed'
                      : isCurrent
                      ? 'current'
                      : 'pending'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Step Title */}
                {titles[index] && (
                  <div className="mt-2 text-center">
                    <p
                      className={`text-xs font-medium ${
                        isCompleted || isCurrent
                          ? 'text-golf-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {titles[index]}
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Line */}
              {index < totalSteps - 1 && (
                <div
                  className={`progress-line ${
                    stepNumber < currentStep ? 'completed' : 'pending'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;