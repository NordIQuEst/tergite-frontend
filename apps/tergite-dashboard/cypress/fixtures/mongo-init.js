db = db.getSiblingDB("testing"); // Create/use database
const toDoc = ({ id, ...props }) => ({ _id: ObjectId(id), ...props });
const toTokenDoc = ({ id, created_at, ...props }) => ({
  _id: ObjectId(id),
  created_at: ISODate(),
  ...props,
});

console.log("Inserting initial data in mongo...");

const calibrations = JSON.parse(cat("calibrations.json")).map(toDoc);
const devices = JSON.parse(cat("device-list.json")).map(toDoc);
const jobs = JSON.parse(cat("jobs.json")).map(toDoc);
const projects = JSON.parse(cat("projects.json")).map(toDoc);
const tokens = JSON.parse(cat("tokens.json")).map(toTokenDoc);
const userRequests = JSON.parse(cat("user-requests.json")).map(toDoc);
const users = JSON.parse(cat("users.json")).map(toDoc);

console.log("Preloading mongodb with...", {
  calibrations,
  devices,
  jobs,
  projects,
  tokens,
  userRequests,
  users,
});

db.auth_projects.insertMany(projects);
db.auth_app_tokens.insertMany(tokens);
db.auth_users.insertMany(users);
db.calibrations_v2.insertMany(calibrations);
db.devices.insertMany(devices);
db.jobs.insertMany(jobs);
db.auth_user_requests.insertMany(userRequests);
