function findScoreIndexOrClosest<T>(
  arr: [score: number, value: T][],
  score: number,
): [matched: boolean, index: number] {
  if (arr.length === 1) {
    return arr[0][0] === score
      ? [true, 0]
      : arr[0][0] > score
      ? [false, 0]
      : [false, 1];
  }
  let low = 0;
  let high = arr.length - 1;
  let mid = 0;
  while (low <= high) {
    mid = Math.floor((low + high) / 2);
    if (arr[mid][0] < score) {
      low = mid + 1;
    } else if (arr[mid][0] > score) {
      high = mid - 1;
    } else {
      return [true, mid];
    }
  }
  return [false, score > arr[mid]?.[0] ? mid + 1 : mid];
}

type ScoreSortedSetSettings = {
  updateExistingValues?: boolean;
  updateMode?: 'GT' | 'LT'; // GT = Greater Than current score, LT = Less Than current score
};

const defaultOptions: ScoreSortedSetSettings = {
  updateExistingValues: true,
  updateMode: 'GT',
};

class ScoreSortedSet<T = any> {
  private _size: number = 0;
  private _values: Map<T, number> = new Map();
  private _scoreValuePairs: [score: number, value: T][] = [];
  private settings: ScoreSortedSetSettings;

  constructor(settings: ScoreSortedSetSettings = {}) {
    this.settings = { ...defaultOptions, ...settings };
  }

add(score: number, value: T): this {
    const currentIndex = this._values.get(value);
    const isValueExists = currentIndex !== undefined;

    if (isValueExists) {
        if (!this.settings.updateExistingValues) {
            return this;
        }
        if (!this._shouldUpdateExistingValue(score, currentIndex)) {
            return this;
        }
        this.delete(value); // Use the fixed delete method
    }

    const [_, closestIndex] = findScoreIndexOrClosest(this._scoreValuePairs, score);
    this._scoreValuePairs.splice(closestIndex, 0, [score, value]);
    this._values.set(value, closestIndex);
    
    // Update indices for elements after the insertion point
    const entries = Array.from(this._values.entries());
    for (const [val, idx] of entries) {
        if (idx >= closestIndex && val !== value) {
            this._values.set(val, idx + 1);
        }
    }

    this._size += 1;
    return this;
}


  
  get(value: T): undefined | T {
    const indexOfValue = this._values.get(value);
    return indexOfValue !== undefined ? this._scoreValuePairs[indexOfValue][1] : undefined;
  }
  
  clear(): void {
    this._size = 0;
    this._values.clear();
    this._scoreValuePairs = [];
  }

  delete(value: T): boolean {
      // Check if value exists
      if (!this._values.has(value)) {
          return false;
      }

      // Get the index of the value
      const index = this._values.get(value)!;
      
      // Remove from the pairs array
      this._scoreValuePairs.splice(index, 1);
      
      // Remove from the values map
      this._values.delete(value);
      
      // Rebuild the index map completely (more reliable than partial updates)
      this._values.clear();
      this._scoreValuePairs.forEach((pair, idx) => {
          this._values.set(pair[1], idx);
      });
      
      this._size -= 1;
      return true;
  }

//   /**
//    * Removes a specified value from the Set.
//    * @returns Returns true if an element in the Set existed and has been removed, or false if the element does not exist.
//    */
//   delete(value: T): boolean {
//     const index = this._values.get(value);
//     if (index === undefined) {
//       return false;
//     }
// 
//     this._scoreValuePairs.splice(index, 1);
//     this._values.delete(value);
// 
//     // Update indices for all elements that were after the deleted one
//     const entries = Array.from(this._values.entries());
//     for (const [val, idx] of entries) {
//         if (idx > index) {
//             this._values.set(val, idx - 1);
//         }
//     }
// 
//     this._size -= 1;
//     return true;
//   }
//   /**
//    * Executes a provided function once per each value in the Set object, in insertion order.
//    */
//   forEach(
//     callbackfn: (value: T, index: number, set: ScoreSortedSet<T>) => void,
//     thisArg?: any,
//   ): void {
//     this._scoreValuePairs.forEach(([_, value], index) => {
//       callbackfn.call(thisArg, value, index, this);
//     });
//   }

  /**
   * @returns a boolean indicating whether an element with the specified value exists in the Set or not.
   */
  has(value: T): boolean {
    const currentRank = this._values.get(value);
    return !!currentRank;
  }

  values(): [score: number, value: T][] {
    return this._scoreValuePairs;
  }

  valuesRangeByScore(
    lowScore: number,
    highScore: number,
    inclusive: boolean = true,
  ): [score: number, value: T][] {
    const [hasValueWithLowScore, lowIndex] = findScoreIndexOrClosest(
      this.values(),
      lowScore,
    );
    const low = hasValueWithLowScore && !inclusive ? lowIndex + 1 : lowIndex;
    let i = low;
    const result: [score: number, value: T][] = [];

    while (
      this._scoreValuePairs[i]?.[0] <= highScore &&
      i < this._scoreValuePairs.length
    ) {
      if (!inclusive && this._scoreValuePairs[i][0] === highScore) {
        break;
      }
      result.push(this._scoreValuePairs[i]);
      i += 1;
    }

    return result;
  }

  /**
   * @returns the number of (unique) elements in Set.
   */
  get size() {
    return this._size;
  }

  protected _shouldUpdateExistingValue(
    score: number,
    currentIndex: number,
  ): boolean {
    const [currentScore] = this._scoreValuePairs[currentIndex];
    const shouldUpdate =
      this.settings.updateMode === 'GT'
        ? currentScore < score
        : currentScore > score;

    return shouldUpdate;
  }
}

