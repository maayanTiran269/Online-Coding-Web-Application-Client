export interface ICodeBlock {
    _id: string; //code block MongoId
    title: string; //title of the block
    template: string; // code block initial template
    solution: string; // solution of the code block
    createdAt: Date; // created time of the code block
    updatedAt: Date; // last update time of the code block
}