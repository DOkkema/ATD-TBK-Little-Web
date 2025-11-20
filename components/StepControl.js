import React from 'react';
import { TRANSLATIONS } from '../translations.js';

const SliderInput = ({label, value, min, max, step, unit, onChange}) => (
    <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-sm">
            <label className="font-medium text-gray-700">{label}</label>
            <span className="text-[#001489] font-mono bg-gray-100 px-1.5 py-0.5 rounded font-bold">
                {step < 1 ? value.toFixed(1) : value.toFixed(0)} {unit}
            </span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#001489]"
        />
    </div>
);


const StepControl = ({ step, onParameterChange, onDuplicate, timeUnit, language = 'nl' }) => {
  const t = TRANSLATIONS[language];
  
  const getUnitLabel = (type) => {
      switch (timeUnit) {
          case 'Seconds': return type === 'cycle' ? t.units.secItem : t.units.sec;
          case 'Minutes': return type === 'cycle' ? t.units.minItem : t.units.min;
          case 'Hours': return type === 'cycle' ? t.units.hrItem : t.units.hr;
      }
  };

  return (
    <div className={`p-2 rounded-xl border-l-4 ${step.color} bg-white shadow-sm border-y border-r border-gray-200 flex flex-col gap-3`}>
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-black whitespace-nowrap">{step.name.split(':')[0]}</h3>
            </div>
            <button
                onClick={onDuplicate}
                className="px-2 py-1 text-xs font-medium text-white bg-[#0093D0] rounded-md hover:bg-[#007BB0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0093D0] transition-colors"
                title={t.controls.copyTooltip}
            >
                {t.controls.copy}
            </button>
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
        <SliderInput
            label={t.stepParams.batchSize}
            value={step.batchSize}
            min={1}
            max={50}
            step={1}
            unit={t.units.items}
            onChange={(e) => onParameterChange('batchSize', parseInt(e.target.value))}
        />
        <SliderInput
            label={t.stepParams.setupTime}
            value={step.setupTime}
            min={0}
            max={120}
            step={1}
            unit={getUnitLabel('setup')}
            onChange={(e) => onParameterChange('setupTime', parseInt(e.target.value))}
        />
        <SliderInput
            label={t.stepParams.cycleTime}
            value={step.cycleTime}
            min={0.5}
            max={10}
            step={0.5}
            unit={getUnitLabel('cycle')}
            onChange={(e) => onParameterChange('cycleTime', parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

export default StepControl;