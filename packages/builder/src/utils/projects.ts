/* eslint-disable import/prefer-default-export */
import { ethers } from "ethers";
import NewProjectRegistryABI from "../contracts/abis/NewProjectRegistry.json";
import ProjectRegistryABI from "../contracts/abis/ProjectRegistry.json";
import { getProviderByChainId } from "./utils";
import { addressesByChainID } from "../contracts/deployments";

export const fetchProjectOwners = (chainID: number, projectID: string) => {
  const addresses = addressesByChainID(chainID);
  const appProvider = getProviderByChainId(chainID);

  const projectRegistryContract = process.env.REACT_APP_DIRECT_GRANTS_ENABLED
    ? addresses.newProjectRegistry!
    : addresses.projectRegistry!;
  const projectRegistryABI = process.env.REACT_APP_DIRECT_GRANTS_ENABLED
    ? NewProjectRegistryABI
    : ProjectRegistryABI;
  const projectRegistry = new ethers.Contract(
    projectRegistryContract,
    projectRegistryABI,
    appProvider
  );

  return projectRegistry.getProjectOwners(projectID);
};
