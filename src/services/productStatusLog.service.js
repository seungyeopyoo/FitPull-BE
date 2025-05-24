import {
    createStatusLogRepo,
    findLogsByProductRepo,
    updateStatusLogRepo,
    deleteStatusLogRepo,
  } from "../repositories/productStatusLog.repository.js";
  
  export const createStatusLog = async ({ userId, productId, type, photoUrls, notes, completedRentalId }) => {
    return await createStatusLogRepo({
      userId,
      productId,
      type,
      photoUrls,
      notes,
      completedRentalId,
    });
  };
  
  export const getLogsByProduct = async (productId) => {
    return await findLogsByProductRepo(productId);
  };
  
  export const updateStatusLog = async (id, data) => {
    return await updateStatusLogRepo(id, data);
  };
  
  export const deleteStatusLog = async (id) => {
    return await deleteStatusLogRepo(id);
  };
  