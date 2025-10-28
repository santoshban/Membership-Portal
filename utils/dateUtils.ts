
import { FinancialYear } from '../types';

export const getFinancialYearForDate = (date: Date): FinancialYear => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed (0 for January)

    let startYear, endYear;

    if (month >= 6) { // July is month 6
        startYear = year;
        endYear = year + 1;
    } else {
        startYear = year - 1;
        endYear = year;
    }

    return {
        start: `${startYear}-07-01`,
        end: `${endYear}-06-30`,
        label: `${startYear}-${endYear}`
    };
};

export const getCurrentFinancialYear = (): FinancialYear => {
    return getFinancialYearForDate(new Date());
};

export const getFinancialYears = (pastRange: number = 5, futureRange: number = 5): FinancialYear[] => {
    const years: FinancialYear[] = [];
    const currentFY = getCurrentFinancialYear();
    const [startCurrent] = currentFY.label.split('-').map(Number);

    // Add past years
    for (let i = pastRange; i > 0; i--) {
        const startYear = startCurrent - i;
        const endYear = startYear + 1;
        years.push({
            start: `${startYear}-07-01`,
            end: `${endYear}-06-30`,
            label: `${startYear}-${endYear}`
        });
    }

    // Add current and future years
    for (let i = 0; i <= futureRange; i++) {
        const startYear = startCurrent + i;
        const endYear = startYear + 1;
        years.push({
            start: `${startYear}-07-01`,
            end: `${endYear}-06-30`,
            label: `${startYear}-${endYear}`
        });
    }

    return years.sort((a,b) => b.label.localeCompare(a.label));
};