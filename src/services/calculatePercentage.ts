 export const calculatePercentage = (thisMonth: number, lastMonth: number) =>{
    if (lastMonth === 0) {
        if (thisMonth === 0) {
            return "No change"; // If both months have no data, return "No change"
        }
        return (thisMonth * 100).toFixed(0) + "%";; // If last month had no data, and this month has some, return 100% profit which doesnot makes sense actually"
    }

    const percent = ((thisMonth) / lastMonth) * 100;
    return Number(percent.toFixed(0) + "%");
 };