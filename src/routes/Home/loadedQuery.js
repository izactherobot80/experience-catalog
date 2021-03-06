import { performQuery } from "../../utils/jsforce";

// TODO: (Isaac) Looks like the Priority__c field can only be set to '2.'  It needs to be able to accept any number and default to null.

const loadedQuery = (jsforce, { user, contactId }, dispatch) =>
  Promise.all([
    performQuery(
      jsforce,
      [
        "SELECT",
        [
          "Id",
          "Strategic_Partner__r.account__r.Name",
          "Name",
          "Strategic_Partner__r.Name",
          "Experience_Type__c",
          "Strategic_Partner__c",
          "Info__c",
          "Keep_In_Mind__c",
          "Experience_Type2__r.Id",
          "Experience_Type2__r.Name",
          "Experience_Type2__r.Image_Path__c",
          "Experience_Type2__r.Short_Name__c",
          "Experience_Type2__r.Alt_Text__c",
          "Partnership_Details_Requirements__c",
          "Pricing_Tier__r.Id",
          "Pricing_Tier__r.Name",
          "Pricing_Tier__r.imageUrl__c",
          "Pricing_Tier__r.Sorting_Order__c",
          "Priority__c",
          "Start_Date__c",
          "End_Date__c",
          // eslint-disable-next-line prettier/prettier
          "Image_URL__c",
          "Thumbnail_URL__c"
        ].join(", "),
        "FROM Experience__c",
        // eslint-disable-next-line prettier/prettier
        "WHERE Strategic_Partner__r.Status__c = 'Current Partner' AND  (Start_Date__c > TODAY OR Start_Date__c = NULL ) ORDER BY Priority__c NULLS LAST,Strategic_Partner__r.Name, Name",
      ].join(" ")
    ),
    performQuery(
      jsforce,
      [
        "SELECT",
        [
          "Id",
          "Status__c",
          "Contact_to_Invite__r.Name",
          "Event_Date__c",
          "Experience__r.Name",
          // eslint-disable-next-line prettier/prettier
        "Name",
        ].join(", "),
        "FROM Strategic_Partner_Request__c",
        "WHERE",
        [`Requester__c = '${user.Id}'`].join(" AND ")
      ].join(" ")
    ),
    contactId &&
      performQuery(
        jsforce,
        [
          "SELECT",
          ["Id", "Name"].join(", "),
          "FROM Contact",
          // eslint-disable-next-line prettier/prettier
        `WHERE ID = '${contactId}'`,
        ].join(" ")
      ).catch(e => {}),
    performQuery(
      jsforce,
      [
        "SELECT",
        [
          "Id",
          "Name",
          "imageUrl__c",
          "Document_Ref__c",
          "Description__c",
          "Sorting_Order__c"
        ].join(", "),
        "FROM Pricing_Tier__c ORDER BY Sorting_Order__c NULLS LAST"
      ].join(" ")
    ).catch(e => {})
  ])
    .then(([newExperiences, partnerRequests, contact, tiers]) => {
      const { records } = newExperiences;
      if (contact && contact.records[0])
        dispatch({
          type: "CONT/data",
          payload: contact.records[0]
        });
      else
        dispatch({
          type: "CONT/remove"
        });
      dispatch({
        type: "EXP/init",
        payload: { records, total: newExperiences.totalSize }
      });
      dispatch({
        type: "TIER/init",
        payload: { records: tiers.records, total: tiers.totalSize }
      });
      dispatch({
        type: "REQ/init",
        payload: {
          records: partnerRequests.records,
          total: partnerRequests.totalSize
        }
      });
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.error(err);
      dispatch({
        type: "ERROR",
        payload: err
      });
    });

export default loadedQuery;
