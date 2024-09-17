export interface UserData{
    _id: string,
    name: string,
    email: string,
    image: string,
    role: Role,
    gender : Gender,
    dob: Date,
    createdAt: Date,
    updatedAt: Date,
    age: number,

}

export enum Role {
    Admin = "admin",
    User = "user"
}

export enum Gender{
    Male = "male",
    Female = "female",
}