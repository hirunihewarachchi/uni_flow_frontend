import api from "./api";

export const getSkillGapAnalysis = async () => {
    const response = await api.get("/ai/skill-gap");
    return response.data.data;
};

export const toggleAssignment = async (data: {
    skillId: string;
    assignmentTitle: string;
    isCompleted: boolean;
}) => {
    const response = await api.post("/ai/skill-gap/toggle-assignment", data);
    return response.data.data;
};

export const getCareerRoadmap = async () => {
    const response = await api.get("/ai/career-roadmap");
    return response.data.data;
};

export const confirmCareerGoal = async (data: {
    selectedRole: string;
    targetCompany?: string;
    targetTimeline?: string;
}) => {
    const response = await api.post("/ai/career-roadmap/confirm", data);
    return response.data.data;
};
