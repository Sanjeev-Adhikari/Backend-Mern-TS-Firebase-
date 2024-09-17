interface MyDocument{
    createdAt: Date,
    discount?: number,
    total?: number
}

interface Proops{
    length: number,
    documentArr: MyDocument[],
    today: Date,
    property?: "discount" | "total",
};

export const chartData = ({length, documentArr, today, property}: Proops )=>{
   
    const data: number[] = new Array(length).fill(0);

    documentArr.forEach((i)=>{
        const creationDate = i.createdAt;
        const monthDifference = (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if(monthDifference < length){
          if(property){
            data[length - monthDifference - 1] += property? i[property]! : 1;
          }else{
            data[length - monthDifference - 1] += 1;
          }
        }
    });
    return data;
}