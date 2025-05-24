import {
    createStatusLog,
    getLogsByProduct,
    updateStatusLog,
    deleteStatusLog,
  } from "../services/productStatusLog.service.js";
  
  export const createStatusLogController = async (req, res) => {
    try {
      const { type, notes, completedRentalId } = req.body;
      const { productId } = req.params;
      const userId = req.user.userId;
  
      // S3에서 업로드된 이미지 URL 추출
      const photoUrls = req.files?.map((file) => file.location) ?? [];
  
      const filteredPhotoUrls = (photoUrls ?? []).filter(url => !!url);
  
      const data = {
        userId,
        productId,
        type,
        photoUrls: filteredPhotoUrls,
        notes,
      };
  
      if (completedRentalId) {
        data.completedRentalId = completedRentalId;
      }
  
      const newLog = await createStatusLog(data);
  
      res.status(201).json({ message: "상태 로그가 등록되었습니다.", log: newLog });
    } catch (error) {
      console.error("상태 로그 생성 에러:", error);
      res.status(500).json({ message: "상태 로그 생성 중 오류가 발생했습니다." });
    }
  };
  
  export const getStatusLogsController = async (req, res) => {
    try {
      const { productId } = req.params;
      const logs = await getLogsByProduct(productId);
      res.status(200).json({ logs });
    } catch (error) {
      console.error("상태 로그 조회 에러:", error);
      res.status(500).json({ message: "상태 로그 조회 중 오류가 발생했습니다." });
    }
  };
  
  export const updateStatusLogController = async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await updateStatusLog(id, req.body);
      res.status(200).json({ message: "상태 로그가 수정되었습니다.", log: updated });
    } catch (error) {
      console.error("상태 로그 수정 에러:", error);
      res.status(500).json({ message: "상태 로그 수정 중 오류가 발생했습니다." });
    }
  };
  
  export const deleteStatusLogController = async (req, res) => {
    try {
      const { id } = req.params;
      await deleteStatusLog(id);
      res.status(200).json({ message: "상태 로그가 삭제되었습니다." });
    } catch (error) {
      console.error("상태 로그 삭제 에러:", error);
      res.status(500).json({ message: "상태 로그 삭제 중 오류가 발생했습니다." });
    }
  };
  