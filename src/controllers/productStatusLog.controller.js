import {
    createStatusLog,
    getLogsByProduct,
    updateStatusLog,
    deleteStatusLog,
  } from "../services/productStatusLog.service.js";
import { getProductById as getProductByIdRepo } from "../repositories/product.repository.js";

export const createStatusLogController = async (req, res) => {
  try {
    const { type, notes, completedRentalId } = req.body;
    const { productId } = req.params;
    const userId = req.user.userId;

    // 상품 삭제 여부 체크
    const product = await getProductByIdRepo(productId);
    if (!product || product.deletedAt) {
      return res.status(400).json({ message: "삭제된 상품에는 로그를 작성할 수 없습니다." });
    }

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
    res.status(500).json({ message: "상태 로그 생성 중 오류가 발생했습니다." });
  }
};

export const getStatusLogsController = async (req, res) => {
  try {
    const { productId } = req.params;
    const logs = await getLogsByProduct(productId);
    res.status(200).json({ logs });
  } catch (error) {
    res.status(500).json({ message: "상태 로그 조회 중 오류가 발생했습니다." });
  }
};

export const updateStatusLogController = async (req, res) => {
  try {
    const { id } = req.params;

    const body = req.body || {};
    const { type, notes, completedRentalId } = body;

    // S3에서 업로드된 이미지 URL 추출
    const photoUrls = req.files?.map((file) => file.location) ?? [];
    const filteredPhotoUrls = (photoUrls ?? []).filter(url => !!url);

    // 수정할 데이터 구성
    const data = {};
    if (type !== undefined) data.type = type;
    if (notes !== undefined) data.notes = notes;
    if (completedRentalId !== undefined) data.completedRentalId = completedRentalId;
    if (filteredPhotoUrls.length > 0) data.photoUrls = filteredPhotoUrls;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "수정할 데이터가 없습니다." });
    }

    const updated = await updateStatusLog(id, data);
    res.status(200).json({ message: "상태 로그가 수정되었습니다.", log: updated });
  } catch (error) {
    res.status(500).json({ message: "상태 로그 수정 중 오류가 발생했습니다." });
  }
};

export const deleteStatusLogController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteStatusLog(id);
    res.status(200).json({ message: "상태 로그가 삭제되었습니다." });
  } catch (error) {
    res.status(500).json({ message: "상태 로그 삭제 중 오류가 발생했습니다." });
  }
};
  