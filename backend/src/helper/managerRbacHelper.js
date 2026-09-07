/**
 * Manager RBAC Helper
 * 
 * Enforces business rules for the 'Manager' role:
 * 1. Managers CANNOT delete any clients, case files, or records.
 * 2. Managers can ONLY update records that they created themselves (matching createdByDid).
 * 3. Admins, Owners, and Superadmins have unrestricted access.
 */

export const isManager = (req) => {
  const role = String(req?.user?.role || '').toLowerCase().trim();
  return role === 'manager';
};

export const getUserDid = (req) => {
  return req?.user?.did || req?.user?.id || null;
};

/**
 * Validates whether the user is permitted to delete a record.
 * If user is a Manager, deletion is strictly forbidden.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {string} entityName 
 * @returns {boolean} true if allowed, false if response sent
 */
export const checkManagerCanDelete = (req, res, entityName = "record") => {
  if (isManager(req)) {
    res.status(403).json({
      status: "error",
      success: false,
      message: `Access denied. Managers are not permitted to delete ${entityName}s.`,
    });
    return false;
  }
  return true;
};

/**
 * Validates whether the user is permitted to update a record.
 * If user is a Manager, they can only update records that they created themselves.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {Object} existingRecord 
 * @param {string} entityName 
 * @returns {boolean} true if allowed, false if response sent
 */
export const checkManagerCanUpdate = (req, res, existingRecord, entityName = "record") => {
  if (!isManager(req)) {
    return true;
  }

  const userDid = getUserDid(req);
  const recordCreatorDid =
    existingRecord?.createdByDid ||
    existingRecord?.createdBy ||
    existingRecord?.uploadedByDid ||
    null;

  // If the record has no creator or creator does not match current manager's DID
  if (!userDid || !recordCreatorDid || String(recordCreatorDid).trim() !== String(userDid).trim()) {
    res.status(403).json({
      status: "error",
      success: false,
      message: `Access denied. Managers can only update ${entityName}s created by themselves.`,
    });
    return false;
  }

  return true;
};
