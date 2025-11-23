/**
 * LMSR (Logarithmic Market Scoring Rule) Implementation
 */

class LMSR {
    constructor(liquidityParameter = 100) {
        this.b = liquidityParameter;
    }

    /**
     * Calculate the cost for a given set of quantities.
     * C(q) = b * ln(sum(e^(q_i / b)))
     * @param {number[]} quantities - Array of quantities for each outcome
     * @returns {number} - The cost
     */
    calculateCost(quantities) {
        const sumExp = quantities.reduce((sum, q) => sum + Math.exp(q / this.b), 0);
        return this.b * Math.log(sumExp);
    }

    /**
     * Calculate the price for a specific outcome given current quantities.
     * P_i(q) = e^(q_i / b) / sum(e^(q_j / b))
     * @param {number[]} quantities - Array of quantities for each outcome
     * @param {number} outcomeIndex - Index of the outcome to calculate price for
     * @returns {number} - The price (probability)
     */
    calculatePrice(quantities, outcomeIndex) {
        const expQ = Math.exp(quantities[outcomeIndex] / this.b);
        const sumExp = quantities.reduce((sum, q) => sum + Math.exp(q / this.b), 0);
        return expQ / sumExp;
    }

    /**
     * Calculate the cost to buy a specific amount of shares for an outcome.
     * Cost = C(q_new) - C(q_old)
     * @param {number[]} currentQuantities - Current quantities
     * @param {number} outcomeIndex - Index of the outcome to buy
     * @param {number} amount - Amount of shares to buy
     * @returns {number} - The cost to buy
     */
    calculateTradeCost(currentQuantities, outcomeIndex, amount) {
        const newQuantities = [...currentQuantities];
        newQuantities[outcomeIndex] += amount;

        const oldCost = this.calculateCost(currentQuantities);
        const newCost = this.calculateCost(newQuantities);

        return newCost - oldCost;
    }
}

module.exports = LMSR;
