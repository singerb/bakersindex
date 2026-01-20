import * as pulumi from "@pulumi/pulumi";
import * as github from "@pulumi/github";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();

const baseDomain = config.require("domain");
const targetDomain = `blog.${baseDomain}`;

// Retrieve information about the currently authenticated user.
const currentUser = github.getUser({
    username: "",
});

const example = new github.Repository("bakersindex", {
	name: "bakersindex",
	hasDiscussions: true,
	hasDownloads: true,
	hasIssues: true,
	hasProjects: true,
	deleteBranchOnMerge: true,
	// TODO: the underlying Terraform provider doesn't support enforcing HTTPS here; do it manually in the UI
	pages: {
		buildType: "legacy",
		source: {
			branch: "main",
			path: "/docs",
		},
		cname: "blog.bakersindex.com",
	}
}, {
	import: "bakersindex"
});

// assumes a Route53 Hosted Zone already exists for the domain
const hostedZone = aws.route53.getZone({ name: baseDomain });

const record = new aws.route53.Record(targetDomain, {
	name: targetDomain,
	zoneId: hostedZone.then(z => z.zoneId),
	type: "CNAME",
	ttl: 300,
	records: currentUser.then(u => [`${u.username}.github.io`]),
});

