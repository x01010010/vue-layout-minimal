---
title: "Getting Started with ShellCreator"
date: "2023-12-04"
category: analytics
type: guides
tags:
- snowflake
duration: "1 hour"
description: |
    Creating your own Snowflake objects
---

It's generally best to familiarize yourself with some general knowledge and history. We'd suggest starting here to read about [ShellCreator](
If you're familiar then you'll want to start by bookmarking [this repository](https://github.com/PCDST/snowflake-shell-configs-data-core-platform). From there you'll want to navigate to the folder for the environment:

* dev/ for sfdev
* qa/ for sfqa
* prod/ for sfprod.

Then you'll pick your business unit.  There are six in total:

* Commercial Lines (CL)
* Claims
* Corporate
* Customer Relations Management (CRM)
* Information Technology (IT)
* Personal Lines (PL)

Next you'll pick your object type:

* database

Here's the repo structure for example:

```bash
├── dev
│   ├── it
│   │   ├── database
│   │   │   ├── dbt_template.yaml
│   │   │   ├── discovery_api.yaml
│   │   │   └── peap_source_replica.yaml
. . .
```

Finally, because you're probably going to want the same infrastructure in each environment, after you pick your folder and file name - Keep the same one in qa/ and prod/!

Once you've picked the right place you'll want to click `Add File` in the top right.

The name of the file doesn't need to conform to any standards, although making it reflect the DaaP is a reasonable idea.

Changing the file name will break your infrastructure.  

Once it is merged into main, **do not** change it.

Once you create the file, you will then specify the parameters.

All the parameters can be found [here](/guides/snowflake/getting_started_shellcreator/#8)

Here's an example of a database:

```yaml
version: 1.10.0
databases:
  - name: sample_db
    entitlement_bases:
      - name: sample_db
        owner: EMP.094690
        tso: EMP.072643
        read_only_owner: EMP.094690
        read_only_tso: EMP.072643
      # Feel free to share them across multiple
      # databases to make a team entitlement!
      - name: sample_team
        owner: EMP.094690
        tso: EMP.072643
        read_only_owner: EMP.094690
        read_only_tso: EMP.072643
    schemas:
      - name: raw
        purpose: raw
      - name: target
        purpose: target
      - name: published
        purpose: published
        # exclude_freethedata tag only needed for shell creator versions prior to 1.12.0
        # Using any version after 1.12.0, you can omit exclude_freethedata tag and follow 
        # [this process](        exclude_freethedata: true
        # Override entitlement bases is a new feature that allows you to override the database entitlements with a separate entitlement base
        # for versions >= 1.17.0
        override_entitlement_bases:
          - name: entitlement_base_name
            tso: EMP.111111
            owner: EMP.222222
            read_only_owner: EMP.111111
            read_only_tso: EMP.222222
    custom_tags:
      - tag: "SUPPORT_GROUP"
        tag_value: 
          support_group_name: "Remedy Support Group Name"
          support_group_email: "DataSupportTeam@progressive.com"
```

This will create a database with three schemas.  It will also create ~20 entitlements specific to your database.  The owner, tso, and read only roles will be owners of some of those entitlements.

In general we recommend picking the entitlement owners like such:

* Owner is the SM Team manager for the team responsible for loading the data/managing the data pipeline.
* TSO is from the SM Team responsible for loading the data/managing the data pipeline.
* Read Only Owner is the data steward for the data.
* Read Only TSO is from the SM Team responsible for loading the data/managing the data pipeline.

The difference between Owner & TSO vs. Read Only Owner & Read Only TSO is that the latter gets to approve the Read Only (RO) entitlements which govern all the data in the `published` schema while the former gets to approve everything else.  You can think of the RO as a sort of "Product Manager" for the data product.

These can't overlap otherwise PIMS won't have an approver when someone is OOO.

We are always working with the PIMs team to make this user experience as seamless as possible.

However, today this will only create the entitlements **if they do not already exist**.  That means, if they do already and you specify a new name, nothing will happen.

That also means, changes to these after being created **will not** make changes to the PIMs system either.

If you need to alter these, today they are still altered via [an SRM request](https://progressive-dwp.onbmc.com/dwp/app/#/itemprofile/11702).

After you're satisfied with your file, you can "Commit Changes" at the top, name your branch and add any helpful messages.

Then you'll be brought to the final page to make a Pull Request (PR), attach some reviewers familiar with your effort, and then you can "Create pull request".

What's happening now is that your file is being processed by the actual business logic baked into the ShellCreator.  If the entitlements you've specified already exist you'll get a success message and you can follow the links at the bottom of the GitHub actions tab.

### Warning Messages

The planning process will post comments on the PR warning you if entitlements will get created or if resources are being deleted as part of the plan.

If entitlements are getting created you will want to ensure that the entitlement base `owner` and `tso` are filled out correctly before merging.  This will stop the apply from failing which would require making changes to the config file and creating a new PR.

### Example

```yaml
entitlement_bases:
    - name: eds
      owner: EMP.876123
      tso: EMP.234876
      read_only_owner: EMP.428398
      read_only_tso: EMP.987445
```

If resources are being deleted you will want to confirm that none of the main resources are being deleted which could cause loss of data or functionality.  These items include databases, schemas, warehouses, and storage integrations.  As you can see below in the example message, the resources will be broken out for you so they are easy to identify and you can always use the link to see the full Terraform plan.  In many cases you will see resources being destroyed when migrating to a new shell creator version.  Unless it's a major version update that includes breaking changes there is no need to be concerned with these deletions.  They typically are caused by changes in the underlying Terraform provider and won't impact your environment.

From the links in the checks on your PR or the Actions tab you will be able to find the [Terraform plan output](https://developer.hashicorp.com/terraform/intro) which we don't expect anyone to fully read or even understand. If you're not familiar with Terraform, that's okay.  You'll notice a lot of things get created.  What you'll want to focus on is near the end.

 The useful bit is towards the end, where any changes are summarized, for example:

This is suggesting that 103 new objects will be created.  When we roll out updates or new features, you might see that grow or shrink on a small change.  The main thing you really are checking for is if it's trying to **destroy (delete)** infrastructure.  You will also see a summarized view of any Snowflake deletes in a comment on your PR which separates objects into `main` and `other`.  The main objects are things like databases, warehouses, and schemas which can cause data loss or loss of functionality and should be reviewed before merging.  Everything in the `other` category is used behind the scenes for features and the RBAC model so we wouldn't expect customers to be concerned with these deletes.

Due to the number of potential deletes in the `other` category they are summarized in the comment but can be found as output in the GitHub action.

Once you're satisfied with the output, you'll want to get a peer review from someone.

We're still working on the perfect guidance for establishing a CODEOWNERS file.  For now it's probably best to update it to include your DA, SME/TSO, and anyone else who would want to be notified or prompted for changes.

Read more [about CODEOWNERS here](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners).

Afterwards all you have to do is click the green "Merge pull request" button on the bottom and your code is shipped off to be elevated!

If you want to track it, you can visit the same actions tab as the previous step or use the comment that's added to the PR with the link to the workflow run.

The logs should say something like this:

```bash
  Apply complete! Resources: 103 added, 0 changed, 0 destroyed.
```

That means your infrastructure is ready!

As of 12-04-21, each resource can make upwards of 15 entitlements per object.  It's hard to capture all the varying use cases here.

Instead take a look at our page on [Roles & Access](
Once you find a description of the situation you're looking for you can request that entitlement via [PIMS/](https://pims:8443/).

Finally, if you need to teardown your infrastructure.  The easiest way to do so would be to delete the contents of the file.

For technical reasons, removing the file simply removes it from the catalog but doesn't actually clean up anything in Snowflake or PIMS.  This can cause a lot of conflict for the next person who comes along and tries to reuse your file name.  Please simply commit and merge an empty file.

Please note - These are destructive operations.  There is no turning back once you merge your file.

If you accidentally delete something you needed, [open an incident ticket](https://progressive-dwp.onbmc.com/dwp/app/#/itemprofile/16101) ASAP.  

By default [we only have 7 days of time travel](https://docs.snowflake.com/en/user-guide/data-time-travel) and [7 further days of failsafe](https://docs.snowflake.com/en/user-guide/data-failsafe).

As of version 1.0.0 we support both yaml and json and although there's no functional difference, yaml does allow comments which we've found to be helpful in explaining your infrastructure to others.

Note, as of 2023 versions before 1.0.0 will not be supported.

## Version

You can find all the versions of Shell Creator on [our GitHub release page](https://github.com/PCDST/snowflake_infra/releases).  

Once you've specified a version, and deployed your infrastructure, it will stay that way until you re-deploy it.  

The implication of this is that **you** now own mutable infrastructure that will require some upkeep, although hopefully small.  If you want to pickup a new feature or encounter bugs your first instinct should be to re-deploy on a newer version.

Databases are for data **storage**.  

### Example

```yaml
databases:
- name: dss_operational_data
  entitlement_bases:
    - name: eds
      owner: EMP.876123
      tso: EMP.234876
      read_only_owner: EMP.428398
      read_only_tso: EMP.987445
    - name: eds_control
      owner: EMP.875603
      tso: EMP.098234
      read_only_owner: EMP.428398
      read_only_tso: EMP.987445
  schemas:
    - name: raw
      purpose: raw
    - name: scratch_pad
      purpose: user_managed
    - name: archive
      purpose: user_managed
    - name: target
      purpose: target
    - name: published
      purpose: published
    override_entitlement_bases:
      - name: entitlement_base_name
        tso: EMP.111111
        owner: EMP.222222
        read_only_owner: EMP.111111
        read_only_tso: EMP.222222
    - name: published_restricted
      purpose: published
      restricted: true
  custom_tags:
    - tag: "SUPPORT_GROUP"
      tag_value: 
        support_group_name: "Remedy Support Group Name"
        support_group_email: "DataSupportTeam@progressive.com"
```

### Parameters

**name** (string) [**REQUIRED**]:

Name of your database.  Please read the [provided standards](

**entitlement_bases** (list (objects)) [**REQUIRED**]:

List of Entitlement bases to be associated with this Database.  Read more about what these mean on our [Roles and Entitlement page](

* **name** (string) [**REQUIRED**]:

    This will be the **base** of the entitlement that is created.  

* **owner** (string) [**REQUIRED**]:

    The approver of all the non-read-only entitlements (ex: L, A, CHS)

* **tso** (string) [**REQUIRED**]:

    The approver of all the non-read-only entitlements (ex: L, A, CHS)

* **read_only_owner** (string) [**REQUIRED**]:

    The approver of the read-only entitlements (ex: R)

* **read_only_tso** (string) [**REQUIRED**]:

    The approver of the read-only entitlements (ex: R)

**schemas** (list (objects)) [**OPTIONAL**]:

Understanding schemas purpose field will have significant implications for how you use your Snowflake infrastructure.  Please [read more about them here](

* **name** (string) [**REQUIRED**]
  
    Name of your schema.

* **purpose** (string) [**REQUIRED**]:
  
    Must be one of: `raw`, `staging`, `user_managed`, `target`, `ods`, or `published`

* **restricted** (boolean) [**OPTIONAL**]:

    If your schema is labeled as `restricted: true` it's access will be limited to those who have the `_RESTRICTED` entitlement.
  
    Additionally, while not enforced through the code, you should name these schemas "<NAME>_RESTRICTED".
  
    Finally, a specific/valid business need from the data steward must exist to label data as restricted.

* **data_retention_days** (integer) [**OPTIONAL**]:

    Number of days to keep data backed up, default is 7.  Read more on [Time Travel and Fail-safe](https://docs.snowflake.com/en/user-guide/data-time-travel) to understand the cost implications.

* **include_freethedata** (boolean) [**OPTIONAL**]:

    This won't actually include schemas in FTD but to get setup with FTD you need to rerun shell creator and this gives users a flag to add which will trigger GHA.  Reference our [how-to](
* **exclude_freethedata** (boolean) [**OPTIONAL**]:
  
    **DEPRECATED as of Version 1.12.1**: This won't override any existing RBAC rules around FTD (Must be QA/PROD and with a purpose of 'published').  But if your data is not restricted and you wish to hide it from  [Free The Data](https://progressiveinsurance.sharepoint.com/sites/enterprise%20data%20governance/SitePages/Free%20The%20Data.aspx) users set this to `True`.  Note, this requires DGO approval.  Reference our [how-to](  
* **additional_published_schemas** (list (string)) [**OPTIONAL**]:

* **override_entitlement_bases** (list (objects)) [**OPTIONAL**]:
    List of Entitlement bases to be associated with this Schema which can only be set for schemas with a purpose of `published` and overrides all entitlements setup at the database level.  Read more about what these mean on our [Roles and Entitlement page](
  * **name** (string) [**REQUIRED**]:

      This will be the **base** of the entitlement that is created.  

  * **owner** (string) [**REQUIRED**]:

      The approver of all the non-read-only entitlements (ex: L, A, CHS)

  * **tso** (string) [**REQUIRED**]:

      The approver of all the non-read-only entitlements (ex: L, A, CHS)

  * **read_only_owner** (string) [**REQUIRED**]:

      The approver of the read-only entitlements (ex: R)

  * **read_only_tso** (string) [**REQUIRED**]:

      The approver of the read-only entitlements (ex: R)

**custom_tags** (list (objects)) [**OPTIONAL**]:

A list of tags to be added to the database.  This option is only available in shell creator version 1.15.1 and above.

* **tag** (string) [**REQUIRED**]:
  
    The name of the tag to add.  Currently only the `SUPPORT_GROUP` tag can be added.

* **tag_value** (string) [**REQUIRED**]:
  
    The value to add for the tag.  While some tags may allow free form text, others will need to have a specific json definition to support automation.

    `tag = SUPPORT_GROUP`:

    The `SUPPORT_GROUP` tag is for the Snowflake alerting process.  See [this](      * **support_group_name** (string) [**REQUIRED**]:

        The name of the Remedy support group where Snowflake incidents should be assigned.

  * **support_group_email** (string) [**REQUIRED**]:

        The email address to notify when there is a Snowflake failure.
