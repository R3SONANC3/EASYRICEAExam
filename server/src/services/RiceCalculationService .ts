import {
  SubStandard,
  Standard,
  GrainData,
  InspectionResult,
  GrainClassification,
  StandardResult,
  DefectResult
} from '../types';

export class RiceCalculationService {
  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'LT': return value < threshold;
      case 'LE': return value <= threshold;
      case 'GT': return value > threshold;
      case 'GE': return value >= threshold;
      default: return false;
    }
  }

  private matchesSubStandard(grain: GrainData, subStandard: SubStandard): boolean {
    if (!subStandard.shape.includes(grain.shape)) {
      return false;
    }

    const meetsMinCondition = subStandard.minLength === undefined || 
      this.evaluateCondition(grain.length, subStandard.conditionMin, subStandard.minLength);
    
    const meetsMaxCondition = subStandard.maxLength === undefined || 
      this.evaluateCondition(grain.length, subStandard.conditionMax, subStandard.maxLength);

    return meetsMinCondition && meetsMaxCondition;
  }

  private calculatePercentage(count: number, total: number): number {
    return Number(((count / total) * 100).toFixed(2));
  }

  private getLengthRangeString(subStandard: SubStandard): string {
    const minOp = subStandard.conditionMin === 'GE' ? '≥' : '>';
    const maxOp = subStandard.conditionMax === 'LE' ? '≤' : '<';
    
    return `${minOp}${subStandard.minLength} - ${maxOp}${subStandard.maxLength}`;
  }

  calculateInspectionResults(
    grains: GrainData[],
    standard: Standard
  ): InspectionResult {
    const totalGrains = grains.length;
    const compositionResults: StandardResult[] = [];
    const unclassifiedGrains: GrainClassification[] = [];

    // Composition (Shape-based classification)
    standard.standardData.forEach(subStandard => {
      const matchingGrains: GrainClassification[] = [];

      grains.forEach(grain => {
        if (this.matchesSubStandard(grain, subStandard)) {
          matchingGrains.push({
            shape: grain.shape,
            type: grain.type,
            length: grain.length,
            weight: grain.weight
          });
        }
      });

      if (matchingGrains.length > 0) {
        compositionResults.push({
          name: subStandard.name,
          percentage: this.calculatePercentage(matchingGrains.length, totalGrains),
          lengthRange: this.getLengthRangeString(subStandard),
          grains: matchingGrains
        });
      }
    });

    grains.forEach(grain => {
      const isClassified = standard.standardData.some(
        subStandard => this.matchesSubStandard(grain, subStandard)
      );

      if (!isClassified) {
        unclassifiedGrains.push({
          shape: grain.shape,
          type: grain.type,
          length: grain.length,
          weight: grain.weight
        });
      }
    });

    // Defect (Type-based classification)
    const typeStats = new Map<string, number>();
    grains.forEach(grain => {
      const count = typeStats.get(grain.type) || 0;
      typeStats.set(grain.type, count + 1);
    });

    const defectResults: DefectResult[] = Array.from(typeStats.entries()).map(([type, count]) => ({
      type,
      percentage: this.calculatePercentage(count, totalGrains)
    }));

    return {
      standardName: standard.name,
      totalSamples: totalGrains,
      classifications: compositionResults, // Shape-based "Composition" category
      unclassified: {
        percentage: this.calculatePercentage(unclassifiedGrains.length, totalGrains),
        grains: unclassifiedGrains
      },
      defects: defectResults // Type-based "Defect" category
    };
  }
}
