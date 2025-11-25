class LMSR {
    constructor(liquidityParameter = 100) {
        this.b = liquidityParameter;
    }

    calculateCost(quantities) {
        return this.b * Math.log(quantities.reduce((sum, q) => sum + Math.exp(q / this.b), 0));
    }

    calculateTradeCost(currentQuantities, outcomeIndex, amount) {
        const oldCost = this.calculateCost(currentQuantities);

        const newQuantities = [...currentQuantities];
        newQuantities[outcomeIndex] += amount;

        const newCost = this.calculateCost(newQuantities);
        return newCost - oldCost;
    }
}

export default new LMSR(100);
