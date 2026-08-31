import mongoose from "mongoose";
const { Schema, model, models } = mongoose;
const schema=new Schema({name:{type:String,required:true},category:{type:String,required:true,index:true},description:String,storageKey:{type:String,required:true},mimeType:{type:String,required:true},size:{type:Number,required:true},version:String,effectiveDate:Date,active:{type:Boolean,default:true,index:true},gradeId:{type:Schema.Types.ObjectId,ref:"Grade"},deletedAt:{type:Date,index:true}},{timestamps:true}); export const DojoDocument=models.DojoDocument??model("DojoDocument",schema);
