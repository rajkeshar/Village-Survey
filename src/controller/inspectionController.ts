import express, { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose';
import deptModal from '../modal/departmentModal';
import surveyModal from '../modal/inspecionModal'
import submitSurveyModal from '../modal/submitSurveyModal';

export async function addNewSurvey(req: Request, res: Response) {
    try {
        let { surveyName, surveyStartDate, surveyEndDate, surveyorName } = req.body

        if (!surveyName) return res.status(400).json({ message: "PLease send required field" });
        let existingSurvey = await surveyModal.findOne({ surveyName: surveyName, 'IsActive': true }) as any
        if (existingSurvey) return res.status(400).json({ message: "survey  modal already exist" });
        let newSurvey = new surveyModal({
            surveyName: surveyName,
            surveyStartDate: surveyStartDate,
            surveyEndDate: surveyEndDate,
            surveyorName: surveyorName
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
        let { deptId, villageId, schemeDetails, surveyorLoginId, deptName, villageName } = req.body;
        if (!surveyId) {
            return res.status(400).json({ message: "SurveyId is required" })
        }
        let updatedSurvey = await surveyModal.findOneAndUpdate(
            {
                _id: new mongoose.Types.ObjectId(surveyId),
                IsOnGoingSurvey: "OnGoing"
            },
            {
                $set: {
                    surveyorLoginId: surveyorLoginId
                },
                $addToSet: {
                    villageUniqueIds: { $each: [villageId] },
                    departmentIds: { $each: [new mongoose.Types.ObjectId(deptId)] }
                }
            }, { new: true }
        );
        if (!updatedSurvey) {
            return res.status(400).send({ message: "This Id is not found, Invalid ID" })
        }
        let surveyDetails = {
            deptId: new mongoose.Types.ObjectId(deptId),
            deptName: deptName,
            schemeDetails: schemeDetails.map(({ schemeId, schemeName, questionnaire }) => ({
                schemeId,
                schemeName,
                questionnaire: questionnaire.map(({ question, questionID, score }) => ({
                    question,
                    questionID: new mongoose.Types.ObjectId(questionID),
                    score,
                })),
            })),
        };
        let totalScore = schemeDetails?.reduce((acc, obj) => acc + obj.questionnaire[0].score, 0);

        let payload = {
            surveyId: new mongoose.Types.ObjectId(surveyId),
            email: surveyorLoginId,
            villageUniqueId: villageId,
            villageName: villageName,
            surveyDetail: surveyDetails,
            totalScore: totalScore
        };
        let scoring = new submitSurveyModal(payload)
        scoring.save();
        return res.status(201).json({ message: "survey submitted successfully", success: true, data: scoring })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
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
            { $match: { "surveyId": new mongoose.Types.ObjectId(surveyId),"email" : email } },
            {
                $group: {
                    _id: {
                        villageName: "$villageName",
                        villageUniqueId: "$villageUniqueId",
                        deptName: "$surveyDetail.deptName"
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
                    totalScore: 1
                }
            }
        ])
        return res.status(201).json({ message: "inspection details fetched successfully", success: true, data: result })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getScoreBiseRank(req: Request, res: Response) {
    try {
        let surveyId = req.params.surveyId;
        let deptId = req.params.deptId;
        if (!surveyId || !deptId) {
            return res.status(400).json({ message: "SurveyId and deptId is required" })
        }
        let villages = await submitSurveyModal.aggregate([
            {
                $match: {
                    "surveyId":new mongoose.Types.ObjectId(surveyId),
                    "surveyDetail.deptId": new mongoose.Types.ObjectId(deptId)
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
async function getFirstDayOfMonth(month) {
    let year = new Date().getFullYear(); // get the current year
    let startdate = new Date(year, month - 1, 1); // set the year and month, and set the day to 1
    let enddate = new Date(year, month, 1); // set the year and month, and set the day to 1\

}

