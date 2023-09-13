import express, { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose';
import deptModal from '../modal/departmentModal';
import surveyModal from '../modal/inspecionModal'
import submitSurveyModal from '../modal/submitSurveyModal';
import { getCountOfAllVillage } from './zoneController';
import zoneModal from '../modal/zoneModal';
import moment from 'moment';
import userModal from '../modal/userModal';
import axios from 'axios';

export async function addNewSurvey(req: Request, res: Response) {
    try {
        let { surveyName, surveyStartDate, surveyEndDate } = req.body

        if (!surveyName) return res.status(400).json({ message: "Please send required field" });
        let existingSurvey = await surveyModal.findOne({ surveyName: surveyName, 'IsActive': true }) as any
        if (existingSurvey) return res.status(400).json({ message: "survey  modal already exist" });
        let newSurvey = new surveyModal({
            surveyName: surveyName,
            surveyStartDate: surveyStartDate,
            surveyEndDate: surveyEndDate,
            // surveyorName: surveyorName  //remove this feild from surveyModal
        });
        await newSurvey.save();
        let a = new submitSurveyModal({ surveyId: new mongoose.Types.ObjectId(newSurvey._id) });
        await a.save();
        return res.status(201).json({ message: "Survey created successfully", success: true, data: newSurvey });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function updateNewSurvey(req: Request, res: Response) {
    try {
        let { id } = req.params;
        let payload = req.body;
        let filter = { _id: new mongoose.Types.ObjectId(id), 'IsActive': true };
        let existingDoc = await surveyModal.findOne(filter);
        if (!existingDoc) return res.status(400).json({ message: "This is not exist, Invalid ID" });

        let updatedDoc = await surveyModal.findOneAndUpdate(filter,
            payload, { new: true });
        return res.status(201).json({ message: "updated successfully", success: true, data: updatedDoc })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function deleteSurvey(req: Request, res: Response) {
    try {
        let { id } = req.params;
        let filter = { _id: new mongoose.Types.ObjectId(id), 'IsActive': true };
        let existingDoc = await surveyModal.findOne(filter);
        if (!existingDoc) return res.status(400).json({ message: "This is not exist, Invalid ID" });

        await surveyModal.findOneAndUpdate(filter, { $set: { 'IsActive': false } });
        return res.status(201).json({ message: "deleted successfully", success: true })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getSurveyById(req: Request, res: Response) {
    try {
        let { id } = req.params;
        let filter = { _id: new mongoose.Types.ObjectId(id), 'IsActive': true };
        let existingDoc = await surveyModal.findOne(filter);
        if (!existingDoc) return res.status(400).json({ message: "This is not exist, Invalid ID" });

        return res.status(201).json({ message: "fetched successfully", success: true, data: existingDoc })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function isOnGoingSurveyTrue(req: Request, res: Response) {
    try {
        let filter = { "IsOnGoingSurvey": "OnGoing", 'IsActive': true };
        let existingDoc = await surveyModal.findOne(filter);
        if (!existingDoc) return res.status(400).json({ message: "There is no OnGoing Survey" });

        return res.status(201).json({ message: "fetched successfully", success: true, data: existingDoc })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function changeSurveyStatus(req: Request, res: Response) {
    try {
        let { id } = req.params;
        let filter = { _id: new mongoose.Types.ObjectId(id), 'IsActive': true };
        let existingDoc = await surveyModal.findOne(filter);
        if (!existingDoc) return res.status(400).json({ message: "This is not exist, Invalid ID" });
        let setQuery = { $set: { IsOnGoingSurvey: "OnGoing" } };
        await surveyModal.updateMany({}, { $set: { IsOnGoingSurvey: "pending" } }, { new: true })
        let result = await surveyModal.findOneAndUpdate(filter, setQuery, { new: true })
        return res.status(201).json({ message: "status changed successfully", success: true, data: result })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}

export async function changeSurveyStatusToFalse(req: Request, res: Response) {

        try {
            let { id } = req.params;
            let filter = { _id: new mongoose.Types.ObjectId(id), 'IsActive': true };
            let existingDoc = await surveyModal.findOne(filter);
            if (!existingDoc) return res.status(400).json({ message: "This is not exist, Invalid ID" });
            let setQuery = { $set: { IsOnGoingSurvey: "pending" } };
        
            let result = await surveyModal.findOneAndUpdate(filter, setQuery, { new: true })
            return res.status(201).json({ message: "status changed successfully", success: true, data: result })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
        }
    
}
export async function getAllSurvey(req: Request, res: Response) {
    try {
        let surveyList = await surveyModal.find({ 'IsActive': true });
        return res.status(201).json({ message: "fetched all successfully", success: true, data: surveyList })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getSurveyDateRange(req: Request, res: Response) {
    try {
        let surveyList = await surveyModal.findOne({ IsActive: true, IsOnGoingSurvey: "OnGoing" }, { surveyStartDate: 1, surveyEndDate: 1, _id: 1 });
        return res.status(201).json({ message: "fetched  successfully", success: true, data: surveyList })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function submitSurvey(req: Request, res: Response) {
    try {
        let surveyId = req.params.id;
        let { villageId, deptDetails, surveyorLoginId, villageName } = req.body;
        console.log(req.body)
        if (!surveyId) {
            return res.status(400).json({ message: "SurveyId is required" })
        }
        //check that survyor is authorize to submit the survey or not
        const user = await userModal.findOne({ email: surveyorLoginId, isInspector: true })

        if (!user) res.status(400).json({ message: "User not found or He is not Inspector" })  // user not found
        else {

            const uniqueDeptIds = [...new Set(deptDetails.map((obj) => obj.deptId))];
            const deptIdsAsObjectIds = uniqueDeptIds.map((id: any) => new mongoose.Types.ObjectId(id));
            const assignedVillages = user?.AssignVillage?.villages;
            const assignedDepartments = user?.AssignDepartments?.departments;

            // check if the user is assigned to the village and department in the request body
            const isAssignedToVillage = assignedVillages?.find(v => v.toString() === villageId.toString());
            const isAssignedToDept = deptIdsAsObjectIds?.every((id: any) => assignedDepartments?.includes(id));;

            // check that survey for same village and deptid should not repeated
            const existingSurvey = await submitSurveyModal.findOne(
                {
                    $and: [
                        { 'villageUniqueId': villageId },{surveyId:surveyId}, { 'surveyDetail.deptId': { $in: deptIdsAsObjectIds } }
                    ]
                });

            if (existingSurvey) { return res.status(400).json({ message: `A survey for village and department  has already been saved.`, data: villageId }) };

            // continue saving the survey

            if (isAssignedToVillage && isAssignedToDept) {

                //village already exist in the survey(survey happend for that village before)
                const alreadyExistVilage = await surveyModal.findOneAndUpdate(
                    {
                        _id: new mongoose.Types.ObjectId(surveyId),
                        'villageUniqueIds.villageId': villageId,
                        IsOnGoingSurvey: "OnGoing"
                    },
                    {
                        $addToSet: {
                            'villageUniqueIds.$.departmentIds':
                                { $each: deptIdsAsObjectIds }
                        }
                    }, { new: true })
                //village not exist in the survey
                if (!alreadyExistVilage) {
                    let updatedSurvey = await surveyModal.findOneAndUpdate(
                        {
                            _id: new mongoose.Types.ObjectId(surveyId),
                            IsOnGoingSurvey: "OnGoing"
                        },
                        {
                            $push: {
                                villageUniqueIds:
                                {
                                    villageId: villageId,
                                    departmentIds: deptIdsAsObjectIds
                                }
                            }
                        }, { new: true });
                    if (!updatedSurvey) {
                        return res.status(400).send({ message: "This Id is not found, Invalid ID" })
                    }
                }

                // {  $addToSet: {
                //         villageUniqueIds: { $each: [villageId] },
                //         departmentIds: { $each: deptIdsAsObjectIds }}
                // }


                // let schemeDetails = {
                //     deptId: new mongoose.Types.ObjectId(deptId),
                //     deptName: deptName,
                //     schemeDetails: schemeDetails.map(({ schemeId, schemeName, questionnaire }) => ({
                //         schemeId,
                //         schemeName,
                //         questionnaire: questionnaire.map(({ question, questionID, score }) => ({
                //             question,
                //             questionID: new mongoose.Types.ObjectId(questionID),
                //             score,
                //         })),
                // })),
                // };
                // let totalScore = schemeDetails?.reduce((acc, obj) => acc + obj.questionnaire[0].score, 0);
                const transformedData = deptDetails.reduce((acc, item) => {
                    const existingDept = acc.find((d) => d.deptId === item.deptId);

                    if (existingDept) {
                        const existingScheme = existingDept.schemeDetails.find(
                            (s) => s.schemeId === item.schemeId
                        );

                        if (existingScheme) {
                            existingScheme.questionnaire.push({
                                question: item.question,
                                questionID: item.questionId,
                                score: item.score,
                            });
                        } else {
                            existingDept.schemeDetails.push({
                                schemeId: item.schemeId,
                                schemeName: item.schemeName,
                                questionnaire: [
                                    {
                                        question: item.question,
                                        questionID: item.questionId,
                                        score: item.score,
                                    },
                                ],
                            });
                        }
                    } else {
                        acc.push({
                            deptId: item.deptId,
                            deptName: item.deptName,
                            schemeDetails: [
                                {
                                    schemeId: item.schemeId,
                                    schemeName: item.schemeName,
                                    questionnaire: [
                                        {
                                            question: item.question,
                                            questionID: item.questionId,
                                            score: item.score,
                                        },
                                    ],
                                },
                            ],
                        });
                    }

                    return acc;
                }, []);

                const finalData = transformedData.map((dept) => ({
                    deptId: new mongoose.Types.ObjectId(dept.deptId),
                    deptName: dept.deptName,
                    schemeDetails: dept.schemeDetails.map((scheme) => ({
                        schemeId: scheme.schemeId,
                        schemeName: scheme.schemeName,
                        questionnaire: scheme.questionnaire.map((question) => ({
                            question: question.question,
                            questionID: new mongoose.Types.ObjectId(question.questionID),
                            score: question.score,
                        })),
                    })),
                }));
                //   let totalScore = finalData.map((x) => {
                //     if (x.schemeDetails?.length) {
                //       return x.schemeDetails.reduce(
                //         (acc, obj) => acc + obj.questionnaire[0].score,
                //         0
                //       );
                //     } else {
                //       return 0;
                //     }
                //   });
                // let payload = {
                //     surveyId: new mongoose.Types.ObjectId(surveyId),
                //     email: surveyorLoginId,
                //     villageUniqueId: villageId,
                //     villageName: villageName,
                //     schemeDetails: surveyDetails,
                //     totalScore: totalScore
                // };
                const payload = finalData.map(obj => ({
                    // ...obj,
                    surveyDetail: { ...obj },
                    surveyId: new mongoose.Types.ObjectId(surveyId),
                    email: surveyorLoginId,
                    villageUniqueId: villageId,
                    villageName: villageName,
                    totalScore: obj.schemeDetails?.reduce((acc, obj) => acc + obj.questionnaire[0].score, 0)
                }));
                //   let totalScore = payload.map((x) => {
                //     return x.surveyDetail.schemeDetails?.reduce((acc, obj) => acc + obj.questionnaire[0].score, 0);
                // });     
                // const setObj = payload.map(obj => ({
                //    ...obj,
                //    totalScore : totalScore.forEach( (x) =>  x)
                //   }));
                let scoring = await submitSurveyModal.insertMany(payload);
                if (scoring.length) {
                    let highestScore = await submitSurveyModal.aggregate([
                        // Match documents with villageUniqueId of "DEO04BOR04"
                        { $match: { villageUniqueId: villageId } },

                        // Project only the totalScore field
                        { $project: { totalScore: 1 } },

                        // Group all documents and sum the totalScore field
                        { $group: { _id: null, totalScore: { $sum: "$totalScore" } } }
                    ]);
                    await surveyModal.findOneAndUpdate(
                        {
                            _id: new mongoose.Types.ObjectId(surveyId),
                            'villageUniqueIds.villageId': villageId,
                            IsOnGoingSurvey: "OnGoing"
                        },
                        {
                            $set: {
                                'villageUniqueIds.$.highestScore': highestScore[0]?.totalScore
                            }
                        }, { new: true })
                }
                let message = await surveySubmitSuccessfullyMessageSendToInspector(surveyorLoginId, user.contactNumber, villageId);
                return res.status(201).json({ message: "survey submitted successfully", success: true, data: scoring })
            } else {
                // user not authorized to save survey for this village and department
                return res.status(400).json({ message: "Surveyor might be storing wrong village and dept data" })
            }
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
async function surveySubmitSuccessfullyMessageSendToInspector(email: string, newPhoneNumber, villageId: any) {
    const message = `Hi User, you have Done the Survey for {#villageId#} on {#var#} successfully. Check the pending survey if any. Nectere Solutions`
    const apiUrl = `https:webpostservice.com/sendsms_v2.0/sendsms.php?apikey=${process.env.apikey}&type=${process.env.TYPE}&sender=${process.env.sender}&mobile=${newPhoneNumber}&message=${message}&peId=${process.env.PEID}&tempId=${process.env.TEMPID}&username=${process.env.username}&password=${process.env.password}`; // Replace with the API endpoint URL

    axios.get(apiUrl)
        .then(response => {
            console.log(response.data);
            return response.data
        }).catch(error => {
            console.error(error);
        });
}
export async function monthlySurveyCompleted(req: Request, res: Response) {
    try {

        let month = req.params.mon as any;
        let year = new Date().getFullYear(); // get the current year
        let startDate = new Date(year, month - 1, 1).toISOString(); // set the year and month, and set the day to 1
        let endDate = new Date(year, month, 1).toISOString(); // set the year and month, and set the day to 1\
        let surveyList = await surveyModal.find({
            $and: [
                {
                    "surveyEndDate": {
                        $gte: startDate,
                        $lt: endDate
                    }
                },
                {
                    "IsOnGoingSurvey": "completed"
                }
            ]
        })
        return res.status(201).json({ message: "fetched  successfully", success: true, data: surveyList })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getInspectionsDetails(req: Request, res: Response) {
    try {
        let surveyId = req.params.id;
        let email = req.params.email;
        if (!surveyId) {
            return res.status(400).json({ message: "SurveyId is required" })
        }
        let result = await submitSurveyModal.aggregate([
            { $match: { "surveyId": new mongoose.Types.ObjectId(surveyId), "email": email } },
            {
                $group: {
                    _id: {
                        villageName: "$villageName",
                        villageUniqueId: "$villageUniqueId",
                        deptName: "$surveyDetail.deptName",
                        email: "$email"
                    },
                    totalScore: { $sum: "$totalScore" }
                }
            },
            {
                $sort: { totalScore: -1 } // sort by totalScore in descending order
            },
            {
                $project: {
                    _id: 0,
                    villageUniqueId: "$_id.villageUniqueId",
                    villageName: "$_id.villageName",
                    deptName: "$_id.deptName",
                    email: "$_id.email",
                    totalScore: 1
                }
            }
        ])
        if (!result.length) return res.status(200).json({ message: "There is no survey done till yet" })
        return res.status(201).json({ message: "inspection details fetched successfully", success: true, data: result })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getScoreBiseRank(req: Request, res: Response) {
    try {
        let surveyId = req.params.surveyId;
        // let deptId = req.params.deptId;
        if (!surveyId) {
            return res.status(400).json({ message: "SurveyId  is required" })
        }
        let villages = await submitSurveyModal.aggregate([
            {
                $match: {
                    "surveyId": new mongoose.Types.ObjectId(surveyId)
                    // "surveyDetail.deptId": new mongoose.Types.ObjectId(deptId)
                }
            },
            {
                $group: {
                    _id: "$villageName",
                    totalScore: { $sum: "$totalScore" },
                },
            },
            // Sort the documents by totalScore in descending order
            {
                $sort: { totalScore: -1 },
            },
            // Project only the necessary fields and add the rank field manually
            {
                $project: {
                    _id: 0,
                    villageName: "$_id",
                    totalScore: 1,
                    rank: {
                        $add: [
                            { $indexOfArray: [["A", "B", "C", "D"], "$$CURRENT.villageName"] },
                            1
                        ]
                    }
                },
            },
        ])
        let rank = 1; // initialize the rank variable to 1
        let numTiedScores = 0;
        let lastScore = null;
        villages?.forEach((village, index) => {
            if (village.totalScore !== lastScore) {
                rank += numTiedScores;
                numTiedScores = 0;
                lastScore = village.totalScore;
            }
            numTiedScores++;
            village.rank = rank;
        });
        return res.status(201).json({ message: "fetched successfully", success: true, data: villages })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function progressDetailofSurvey(req: Request, res: Response) {
    try {
        let surveyId = req.params.surveyId;
        if (!surveyId) {
            return res.status(400).json({ message: "SurveyId is required" })
        }
        let villageCount = await zoneModal.aggregate([
            { $unwind: "$blocks" },
            { $unwind: "$blocks.taluka.villages" },
            { $count: "totalVillages" }
        ]) as any
        let villageUniqueIdCount = await submitSurveyModal.find({ "surveyId": new mongoose.Types.ObjectId(surveyId) }).distinct('villageUniqueId') as any;
        let date = await surveyModal.find({ _id: new mongoose.Types.ObjectId(surveyId) }, { "surveyStartDate": 1 }) as any
        let remaingsurveyVillage = villageCount[0].totalVillages - villageUniqueIdCount.length;
        const end = moment(date[0].surveyStartDate);
        const now = moment(new Date());
        const remaingSurveyDays = (now.diff(end, 'days'));
        return res.status(201).json({ message: "Remaning Village From survey fetched successfully", success: true, data: { remaingsurveyVillage, remaingSurveyDays } })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getDashBoardDetail(req: Request, res: Response) {
        try {
            const surveyId = req.params.surveyId;
            if (!surveyId) {
                return res.status(400).json({ message: "SurveyId is required" });
            }
            const surveys = await surveyModal.findOne({_id : new mongoose.Types.ObjectId(surveyId)}, 'villageUniqueIds.highestScore villageUniqueIds.departmentIds villageUniqueIds.villageId').sort({ 'villageUniqueIds.highestScore': -1 }) as any;
            const villageIDs = surveys.villageUniqueIds.map((village) => village.villageId);
            const departmentIds = surveys.villageUniqueIds.map((village) => village.departmentIds);

            // console.log(surveys)
            // console.log(departmentIds)
            // console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")



            const result = await submitSurveyModal.find({ surveyId: new mongoose.Types.ObjectId(surveyId) });

            console.log(result)
            const emails = result.map(item => item.email).filter((value, index, self) => self.indexOf(value) === index);
              console.log(emails,"ji")
            if (result) {
                const users = await userModal.find(
                    { email: { $in: emails } },
                    {
                        'AssignVillage.villages': 1,
                        'AssignDepartments.departments': 1,
                        'fullname': 1,
                        'email': 1
                    }
                ) as any;
    
                users.forEach((user) => {
                    if (villageIDs.includes(user.AssignVillage.villages[0])){
                    //  &&
                        // departmentIds.some((dept) => Object.values(dept)[0] === user.AssignDepartments.departments[0])) {
                            surveys.villageUniqueIds.forEach((obj) => {
                            obj.surveyorName = user.fullname
                      })
                    }
                });
                const villageNames = await zoneModal.aggregate([
                    { $match: { "blocks.taluka.villages.villageUniqueId": { $in: villageIDs } } },
                    { $unwind: "$blocks" },
                    { $unwind: "$blocks.taluka.villages" },
                    {
                        $project: {
                            villageName: "$blocks.taluka.villages.villageName",
                            villageUniqueId: "$blocks.taluka.villages.villageUniqueId"
                        }
                    }
                ]) as any;
                const villageData = villageNames.filter(village => villageIDs.includes(village.villageUniqueId));
                surveys.villageUniqueIds.sort((a, b) => b.highestScore - a.highestScore);
                let deptData = [] as any
                let surveyData = await submitSurveyModal.find({ surveyId : new mongoose.Types.ObjectId(surveyId) })
                // surveys.villageUniqueIds.map(villageObj =>  
                // })
                surveyData?.forEach((survey:any) =>{
                    deptData.push({
                        'email': survey.email,
                        'villageId': survey.villageUniqueId,
                        'deptId' : survey?.surveyDetail.deptId,
                        'deptName' : survey?.surveyDetail.deptName,
                        'totalScore' : survey?.totalScore ? survey?.totalScore : '',
                    })
                })

                // users.forEach((user) => {
                //     const email = user.email;
                //     const matchingDept = deptData.find((dept) => dept.email === email);
                
                //     if (matchingDept) {
                //         matchingDept.fullname = user.fullname;
                //     }
                // });
                deptData.map((dept) => {
                    const email = dept.email;
                    const matchingDept = users.find((user) => user.email === email);
                
                    if (matchingDept) {
                        dept.fullname = matchingDept.fullname;
                    }
                });
                
                // surveys.deptData = deptData
                return res.status(201).json({
                    message: 'Dashboard details sent successfully',
                    data: {surveys,deptData},
                    success: true
                });
            }
    
            return res.status(201).json({ message: "Can't find details", success: true, data: result });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false });
        }
    }

    export async function topRankingVilaages(req: Request, res: Response) {
       try{

        const surveyData:any = await surveyModal.find({IsOnGoingSurvey:"OnGoing"})

        const result = await submitSurveyModal.find({})
          
        let data = result.map((village)=>{
            
            return village.villageUniqueId
        })


        console.log(data)

       let submitSurvetDeptScore:any = []

       
        result.map((deptScore:any)=>{
            let singleSurveuObj:any = {}
            let finalScore = 0

            deptScore.surveyDetail.schemeDetails.map((schemeScore:any)=>{
                schemeScore.questionnaire.map((questionScore)=>{
                      finalScore = finalScore + questionScore.score
                })
                singleSurveuObj = {
                    villageName:deptScore.villageName,
                    villageUniqueId:deptScore.villageUniqueId,
                    email:deptScore.email,
                    surveyId:deptScore.surveyId,
                    totalScore:deptScore.totalScore,
                    departmants:[{
                        deptId:deptScore.surveyDetail.deptId,
                        deptName:deptScore.surveyDetail.deptName,
                        email:deptScore.email,
                        score:finalScore,
                        schemeDetails:schemeScore

                    }]
                }
            })

            

           

            submitSurvetDeptScore.push(singleSurveuObj)

        })
          
        let arrOfResult:any = []
        console.log(submitSurvetDeptScore)
        submitSurvetDeptScore.map((matchVillage:any,index,arr)=>{
            if(matchVillage)
            {
            let objOfResult:any ={
                "villageName": matchVillage.villageName,
                "villageUniqueId": matchVillage.villageUniqueId,
                "surveyId":matchVillage.surveyId,
                "email":matchVillage.email,
                "totalScore": matchVillage.totalScore,
                "departmants":[]
            }

            submitSurvetDeptScore.map((filter:any)=>{
                
                if(filter.villageUniqueId == matchVillage.villageUniqueId)
                {
                    // console.log(filter.departmants,"filter.departmants")

                    if(filter.departmants)
                    {
                        objOfResult.departmants.push(filter.departmants[0])
                    }
                }
            })

            arrOfResult.push(objOfResult)
        }

        })



        let newArrayOfResult :any = []

        for(let singleObj of arrOfResult){
            if(newArrayOfResult.length == 0){
                newArrayOfResult.push(singleObj)
            }else{
                if( ! newArrayOfResult.find((obj : any)=>obj.villageUniqueId == singleObj.villageUniqueId)){
                    newArrayOfResult.push(singleObj)
                }
            }
        }
        let startRange = req.body.startRange
        let endRange = req.body.endRange

        if(endRange > newArrayOfResult.length)
        {
            endRange = newArrayOfResult.length
        }

        let finalNewArrayOfData:any = []
        for(let range=0 ; range<newArrayOfResult.length ; range++)
        {
        let deptTotalScore = 0
      
        
            newArrayOfResult[range].departmants.map((scr)=>{
                deptTotalScore = deptTotalScore + scr.score
            })
              finalNewArrayOfData.push({...newArrayOfResult[range],deptTotalScore})
        }

        
         let sortedArray = finalNewArrayOfData.sort((a, b) => b.deptTotalScore - a.deptTotalScore)
         let arrayWithRank:any = []
         console.log(sortedArray)
         sortedArray.map((rank,index)=>{
             arrayWithRank.push({
                "rank":index+1,
                ...rank
             })
         })

         
        res.status(200).json({data:arrayWithRank,btn:newArrayOfResult.length/5})

       }
       catch(error)
       {
        console.log(error)
        res.status(500).json(error)

       }
    }

    export async function checkMatrix(req: Request, res: Response) {
        try {

            let dist = await zoneModal.findOne({ IsActive: true });
            let deptList:any = await deptModal.find({IsActive:true,isDisable:false})
            let deptListDisable:any = await deptModal.find({IsActive:true,isDisable:true})

           


            console.log(deptList.length)

            if (!dist) return res.status(201).send({ message: "District Id or block Id is not found, Invalid ID" })
            let villageArray = [] as any;
            let result = await zoneModal.aggregate([
                { $unwind: "$blocks" },
                { $unwind: "$blocks.taluka.villages" },
                {
                    $project: {
                        _id: 1,
                        districtName: 1,
                        villageName: "$blocks.taluka.villages.villageName",
                        villageUniqueId: "$blocks.taluka.villages.villageUniqueId"
                    }
                }])



               let users = await userModal.find({IsActive:true})
            

               
               
               let newArray:any = [ ]
               let newArrayOfDept:any = [ ]

               let totalDept = 0
               users.map((user:any,index)=>{
                   totalDept = totalDept + user.AssignDepartments.departments.length
                if(index == users.length - 1)
                {
                   user.AssignVillage.villages.map((ids)=>{
                       newArray.push(ids)
                    })

                    newArrayOfDept.push(user.AssignVillage.villages.length * user.AssignDepartments.departments.length)
                }
                })
                console.log(totalDept)
                let disableDepthLength = 0
                users.map((user:any,index)=>{
                    deptListDisable.map(((disDep)=>{
                        if(user.AssignDepartments.departments.includes(disDep._id))
                        {
                            disableDepthLength = disableDepthLength + 1
                        }

                    }))
                })
                console.log(disableDepthLength)
               let newArrayOfResult :any = []

               for(let singleObj of newArray){
                   if(newArrayOfResult.length == 0){
                       newArrayOfResult.push(singleObj)
                   }else{
                       if( ! newArrayOfResult.find((obj : any)=>obj == singleObj)){
                           newArrayOfResult.push(singleObj)
                       }
                   }
               }         
               console.log(totalDept,"totalDept")
               console.log(result.length)
               console.log(newArrayOfResult.length)
               
               console.log(deptList.length * users.length ,"deptList.length * users.length")
               if(deptList.length * users.length == totalDept - disableDepthLength)
               {

                if(result.length == newArrayOfResult.length)
                {
                    return res.status(201).send({ message: "true" })

                }
                else{
                return res.status(500).send({ message: "no" })

                }

                   
               }
               else{
                return res.status(500).send({ message: "yes",deptListDisable:deptListDisable })

               }


        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
        }
    }
    

    export async function departmantQuestionRankData(req: Request, res: Response) {
        try{
         const result = await submitSurveyModal.find({})
           
         let data = result.map((village)=>{
             
             return village.villageUniqueId
         })
 
 
         console.log(data)
 
        let submitSurvetDeptScore:any = []
        
         result.map((deptScore:any)=>{
             let singleSurveuObj:any = {}
             let finalScore = 0
 
             deptScore.surveyDetail.schemeDetails.map((schemeScore:any)=>{
                 schemeScore.questionnaire.map((questionScore)=>{
                       finalScore = finalScore + questionScore.score
                 })
                 singleSurveuObj = {
                     villageName:deptScore.villageName,
                     villageUniqueId:deptScore.villageUniqueId,
                     email:deptScore.email,
                     surveyId:deptScore.surveyId,
                     totalScore:deptScore.totalScore,
                     departmants:[{
                         deptId:deptScore.surveyDetail.deptId,
                         deptName:deptScore.surveyDetail.deptName,
                         score:finalScore,
                         schemeDetails:deptScore.surveyDetail.schemeDetails
 
                     }]
                 }
             })
 
             
 
            
 
             submitSurvetDeptScore.push(singleSurveuObj)
 
         })
           
         let arrOfResult:any = []
         submitSurvetDeptScore.map((matchVillage:any,index,arr)=>{
             let objOfResult:any ={
                 "villageName": matchVillage.villageName,
                 "villageUniqueId": matchVillage.villageUniqueId,
                 "surveyId":matchVillage.surveyId,
                 "email":matchVillage.email,
                 "totalScore": matchVillage.totalScore,
                 "departmants":[]
             }
 
             submitSurvetDeptScore.map((filter:any)=>{
                 
                 if(filter.villageUniqueId == matchVillage.villageUniqueId)
                 {
                         objOfResult.departmants.push(filter.departmants[0])
                 }
             })
 
             arrOfResult.push(objOfResult)
                 
 
         })
 
 
 
         let newArrayOfResult :any = []
 
         for(let singleObj of arrOfResult){
             if(newArrayOfResult.length == 0){
                 newArrayOfResult.push(singleObj)
             }else{
                 if( ! newArrayOfResult.find((obj : any)=>obj.villageUniqueId == singleObj.villageUniqueId)){
                     newArrayOfResult.push(singleObj)
                 }
             }
         }
         let startRange = req.body.startRange
         let endRange = req.body.endRange
 
         if(endRange > newArrayOfResult.length)
         {
             endRange = newArrayOfResult.length
         }
 
         let finalNewArrayOfData:any = []

         let finalVillage = newArrayOfResult.filter((checkItIs)=>{

            return checkItIs.villageUniqueId == req.body.villageUniqueId && checkItIs.surveyId == req.body.surveyId
         })

         console.log(finalVillage)
         
        //  newArrayOfResult.map( (deptsData:any)=>{
        //     let questionDataArrayList:any = []
        //     deptsData.departmants.map((question:any)=>{

                
        //         question.schemeDetails.map((questionAdd:any)=>{
        //              questionAdd.map(())

        //         })

        //     })

        //     finalNewArrayOfData.push({...deptsData,newArrayOfResult})

        //  })

        let finalDepartmant:any = finalVillage[0].departmants.filter((deptCHeck)=>{
            return deptCHeck.deptId == req.body.deptId
        })

        let questionArray:any = []

         finalDepartmant[0].schemeDetails.map((questionAdd)=>{

            questionAdd.questionnaire.map((ques)=>{


                 let obj = {
                    surveyId:finalVillage[0].surveyId,
                    schemeId:questionAdd.schemeId,
                    schemeName:questionAdd.schemeName,
                    question:ques.question,
                    questionID:ques.questionID,
                    score:ques.score
                 }
                questionArray.push(obj)

            })

         })


        

         res.status(200).json(questionArray)
 
        }
        catch(error)
        {
         res.status(500).json(error)
 
        }
     }
    export async function topRankingDepartmants(req:Request, res:Response)
    {
        try{
            const dept = await deptModal.find({})
            const result = await submitSurveyModal.find({})
          
            let data = result.map((village)=>{
                
                return village.villageUniqueId
            })
    
    
            console.log(data)
    
           let submitSurvetDeptScore:any = []
            result.map((deptScore:any)=>{
                let singleSurveuObj:any = {}
                let finalScore = 0
    
                deptScore.surveyDetail.schemeDetails.map((schemeScore:any)=>{
                    schemeScore.questionnaire.map((questionScore)=>{
                          finalScore = finalScore + questionScore.score
                    })
                    singleSurveuObj = {
                        villageName:deptScore.villageName,
                        villageUniqueId:deptScore.villageUniqueId,
                        email:deptScore.email,
                         surveyId:deptScore.surveyId,

                        totalScore:deptScore.totalScore,
                        departmants:[{
                            deptId:deptScore.surveyDetail.deptId,
                            deptName:deptScore.surveyDetail.deptName,
                            score:finalScore
    
                        }]
                    }
                })
    
                
    
               
    
                submitSurvetDeptScore.push(singleSurveuObj)
    
            })
              
            let arrOfResult:any = []
            submitSurvetDeptScore.map((matchVillage:any,index,arr)=>{
                console.log(matchVillage)
                let objOfResult:any ={
                    "villageName": matchVillage.villageName,
                    "villageUniqueId": matchVillage.villageUniqueId,
                    "surveyId":matchVillage.surveyId,
                    "email":matchVillage.email,
                    "totalScore": matchVillage.totalScore,
                    "departmants":[]
                }
    
                submitSurvetDeptScore.map((filter:any)=>{
    
                    
                    if(filter.villageUniqueId == matchVillage.villageUniqueId)
                    {
    
                            objOfResult.departmants.push(filter.departmants[0])
                    }
                })
    
                arrOfResult.push(objOfResult)
                    
    
            })
    
    
    
            let newArrayOfResult :any = []
    
            for(let singleObj of arrOfResult){
                if(newArrayOfResult.length == 0){
                    newArrayOfResult.push(singleObj)
                }else{
                    if( ! newArrayOfResult.find((obj : any)=>obj.villageUniqueId == singleObj.villageUniqueId)){
                        newArrayOfResult.push(singleObj)
                    }
                }
            }
            let startRange = req.body.startRange
            let endRange = req.body.endRange
    
            if(endRange > newArrayOfResult.length)
            {
                endRange = newArrayOfResult.length
            }
    
            let finalNewArrayOfData:any = []
            for(let range= startRange ; range<endRange ; range++)
            {
            let deptTotalScore = 0
          
            
                newArrayOfResult[range].departmants.map((scr)=>{
                    deptTotalScore = deptTotalScore + scr.score
                })
                  finalNewArrayOfData.push({...newArrayOfResult[range],deptTotalScore})
            }
            const departmentBasedVillage:any = []
            dept.map((dep:any,index:number)=>{
                let villagesArray:any = []
                finalNewArrayOfData.map((village:any,i:number)=>{
                    village.departmants.map((deptData)=>{
                        if(deptData.deptId.toString() == dep._id.toString()){
                            villagesArray.push({...village,deptScore:deptData.score})
                        }
                    })
                    
                   

                    
                }

                )
                let obj = {
                    id:dep._id,deptName:dep.deptName,villages:[...villagesArray]
                }
                departmentBasedVillage.push(obj)
            }
        )
        console.log(departmentBasedVillage)

       

            
            res.status(200).json({data:departmentBasedVillage,btn:newArrayOfResult.length/5})            
            


        }
        catch(err)
        {
            res.status(200).json(err)            

        }
    }
    export async function getSurveyStatus(req: Request, res: Response) {
        try{
            const surveyData:any = await surveyModal.find({IsOnGoingSurvey:"OnGoing"})
            // const survey = surveyModal.find({IsActive:true})
            console.log(surveyData,"joooo")
            const result = await submitSurveyModal.find({surveyId:surveyData[0]._id})
            const dept = await deptModal.find({ 'IsActive': true,'isDisable':false, })
            let zone:any = await zoneModal.aggregate([
                { $unwind: "$blocks" },
                { $unwind: "$blocks.taluka.villages" },
                {
                    $project: {
                        _id: 1,
                        districtName: 1,
                        villageName: "$blocks.taluka.villages.villageName",
                        villageUniqueId: "$blocks.taluka.villages.villageUniqueId"
                    }
                }])

              
            let data = result.map((village)=>{
                
                return village.villageUniqueId
            })
    
    
            console.log(data)
    
           let submitSurvetDeptScore:any = []
            result.map((deptScore:any)=>{
                let singleSurveuObj:any = {}
                let finalScore = 0
                // let allSchemaData:any = []
                deptScore.surveyDetail.schemeDetails.map((schemeScore:any)=>{
                    schemeScore.questionnaire.map((questionScore)=>{
                          finalScore = finalScore + questionScore.score
                        //   allSchemaData.push(questionScore)
                    })
                    singleSurveuObj = {
                        villageName:deptScore.villageName,
                        villageUniqueId:deptScore.villageUniqueId,
                        email:deptScore.email,
                        surveyId:deptScore.surveyId,
                        totalScore:deptScore.totalScore,
                        departmants:[{
                            deptId:deptScore.surveyDetail.deptId,
                            deptName:deptScore.surveyDetail.deptName,
                            email:deptScore.email,
                            score:finalScore,
                            schemeDetails:deptScore.surveyDetail.schemeDetails
    
                        }]
                    }
                })
    
                
    
               
    
                submitSurvetDeptScore.push(singleSurveuObj)
    
            })
              
            let arrOfResult:any = []
            submitSurvetDeptScore.map((matchVillage:any,index,arr)=>{
                let objOfResult:any ={
                    "villageName": matchVillage.villageName,
                    "villageUniqueId": matchVillage.villageUniqueId,
                    "surveyId":matchVillage.surveyId,
                    "email":matchVillage.email,
                    "totalScore": matchVillage.totalScore,
                    "departmants":[]
                }
    
                submitSurvetDeptScore.map((filter:any)=>{
                    
                    if(filter.villageUniqueId == matchVillage.villageUniqueId)
                    {
                            objOfResult.departmants.push(filter.departmants[0])
                    }
                })
    
                arrOfResult.push(objOfResult)
                    
    
            })
    
    
    
            let newArrayOfResult :any = []
    
            for(let singleObj of arrOfResult){
                if(newArrayOfResult.length == 0){
                    newArrayOfResult.push(singleObj)
                }else{
                    if( ! newArrayOfResult.find((obj : any)=>obj.villageUniqueId == singleObj.villageUniqueId)){
                        newArrayOfResult.push(singleObj)
                    }
                }
            }
            let startRange = req.body.startRange
            let endRange = req.body.endRange
    
            if(endRange > newArrayOfResult.length)
            {
                endRange = newArrayOfResult.length
            }
    
            let finalNewArrayOfData:any = []
            for(let range=0 ; range<newArrayOfResult.length ; range++)
            {
            let deptTotalScore = 0
          
            
                newArrayOfResult[range].departmants.map((scr)=>{
                    deptTotalScore = deptTotalScore + scr.score
                })
                  finalNewArrayOfData.push({...newArrayOfResult[range],deptTotalScore})
            }
    
            
             let sortedArray = finalNewArrayOfData.sort((a, b) => b.deptTotalScore - a.deptTotalScore)
             let arrayWithRank:any = []
             sortedArray.map((rank,index)=>{
                 arrayWithRank.push({
                    "rank":index+1,
                    ...rank
                 })
             })
               
             let isDepartmentComplete = arrayWithRank.map((check)=>{
                return check.departmants.length == dept.length
             })

             if(isDepartmentComplete.includes(false))
             {
                res.status(200).json({mssg:"survay is not completed",zone:zone.length})
             }
             else
             {
                if(isDepartmentComplete.length == zone.length)
                {
                    let changeStatus =  await surveyModal.findByIdAndUpdate({_id:surveyData[0]._id,IsOnGoingSurvey:"completed"})

                    res.json({mssg:"successs",zone})
                }
             }
             
            // res.status(200).json({data:zone})
    
           }
        catch(err)
        {
            res.json(err)
        }
    }
export async function getHighScoreVillage(req: Request, res: Response) {
    const { surveyId } = req.params;
    try {
        // Check if survey has been done in all villages
        const totalVillages = await zoneModal.aggregate([
            { $unwind: "$blocks" },
            { $unwind: "$blocks.taluka.villages" },
            { $count: "totalVillages" }
        ]) as any
        const surveyedVillages = await submitSurveyModal.distinct("villageUniqueId", { "surveyId": new mongoose.Types.ObjectId(surveyId) });
        if (totalVillages[0]?.totalVillages !== surveyedVillages.length) {
            return res.status(400).json({
                message: 'Survey is not complete in all villages',
            });
        }

        // Check if all departments have been surveyed
        const totalDepts = await deptModal.countDocuments({});
        const surveyedDepts = await submitSurveyModal.find({ 'surveyId': new mongoose.Types.ObjectId(surveyId) }).distinct('surveyDetail.deptId');
        if (totalDepts !== surveyedDepts.length) {
            return res.status(400).json({
                message: 'All departments have not been surveyed yet',
            });
        }

        // Get the total score for each village
        const result = await surveyModal.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(surveyId) }
            },
            {
                $unwind: "$villageUniqueIds"
            },
            {
                $sort: {
                    "villageUniqueIds.highestScore": -1
                }
            },
            {
                $group: {
                    _id: null,
                    maxScore: { $max: "$villageUniqueIds.highestScore" },
                    minScore: { $min: "$villageUniqueIds.highestScore" },
                    count: { $sum: 1 },
                    villages: { $push: { villageId: "$villageUniqueIds.villageId", highestScore: "$villageUniqueIds.highestScore" } }
                }
            },
            {
                $project: {
                    _id: 0,
                    maxScore: 1,
                    minScore: 1,
                    midScore: { $arrayElemAt: ["$villages.highestScore", { $floor: { $divide: ["$count", 2] } }] },
                    highestScoringVillage: {
                        villageId: { $arrayElemAt: ["$villages.villageId", 0] },
                        highestScore: { $arrayElemAt: ["$villages.highestScore", 0] }
                    },
                    lowestScoringVillage: {
                        villageId: { $arrayElemAt: ["$villages.villageId", -1] },
                        highestScore: { $arrayElemAt: ["$villages.highestScore", -1] }
                    }, midScoringVillage: {
                        $arrayElemAt: ["$villages.villageId", { $floor: { $divide: ["$count", 2] } }]
                    }
                }
            }
        ]);
        return res.status(400).json({ message: 'fetched villages record as per score', data: result, success: true });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
async function getFirstDayOfMonth(month) {
    let year = new Date().getFullYear(); // get the current year
    let startdate = new Date(year, month - 1, 1); // set the year and month, and set the day to 1
    let enddate = new Date(year, month, 1); // set the year and month, and set the day to 1\

}
function calculateMedianScore(scores) {
    const sortedScores = scores.sort((a, b) => a - b);
    const middle = Math.floor(sortedScores.length / 2);
    if (sortedScores.length % 2 === 0) {
        return (sortedScores[middle - 1] + sortedScores[middle]) / 2;
    }
    return sortedScores[middle];
}



