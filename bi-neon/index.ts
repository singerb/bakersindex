import * as pulumi from "@pulumi/pulumi";
import * as neon from '@pulumi/neon';

// Create our base project.
const project = new neon.Project('biNeonProject', {
	name: 'bakersindex',
	pgVersion: 17,
	regionId: 'aws-us-east-1',
	orgId: 'org-divine-leaf-29496710',
	historyRetentionSeconds: 3600,
	branch: {
		name: "production",
		databaseName: "bi_db",
		roleName: "bi_user",
	},
});

// Create a new branch for staging from the project's primary branch.
const stagingBranch = new neon.Branch('biStagingBranch', {
	projectId: project.id,
	name: "staging",
	// parentId is optional; defaults to the project's primary branch.
	// parentId: myAppProject.defaultBranchId,
});

// Create a read-write endpoint to connect to the staging branch.
// Note: may have to `pulumi up` twice to get the proper pooled URI?
const stagingEndpoint = new neon.Endpoint('biStagingEndpoint', {
	projectId: project.id,
	branchId: stagingBranch.id,
	type: 'read_write', // "read_write" or "read_only"
	autoscalingLimitMinCu: 0.25,
	autoscalingLimitMaxCu: 0.5,
	poolerEnabled: true,
});

// Role and DB will get inherited from the main production branch.

// --- Exporting outputs ---
export const projectId = project.id;

export const productionBranchId = project.defaultBranchId;
export const productionUriPooled = pulumi.secret(project.connectionUriPooler);
export const productionUri = pulumi.secret(project.connectionUri);

export const stagingBranchId = stagingBranch.id;
export const stagingUriPooled = pulumi.secret(pulumi.interpolate`postgresql://${project.databaseUser}:${project.databasePassword}@${stagingEndpoint.host}/${project.databaseName}?sslmode=require&channel_binding=require`)
export const stagingUri = pulumi.secret(pulumi.interpolate`postgresql://${project.databaseUser}:${project.databasePassword}@${stagingEndpoint.host.apply(h => h.replace("-pooler", ""))}/${project.databaseName}?sslmode=require&channel_binding=require`)
