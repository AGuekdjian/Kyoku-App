import mongoose from "mongoose";
const { Schema, model, models } = mongoose;
const schema = new Schema({ studentId:{type:Schema.Types.ObjectId,ref:"Student",required:true,index:true},previousGradeId:{type:Schema.Types.ObjectId,ref:"Grade"},newGradeId:{type:Schema.Types.ObjectId,ref:"Grade",required:true},date:{type:Date,required:true,index:true},examId:{type:Schema.Types.ObjectId,ref:"Exam"},result:String,notes:String },{timestamps:true});
schema.index({studentId:1,date:-1}); export const GradeHistory=models.GradeHistory??model("GradeHistory",schema);
