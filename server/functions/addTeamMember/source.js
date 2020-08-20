exports = async function(email) {
  const collection = context.services.get("mongodb-atlas").db("tracker").collection("User");
  const filter = {name: email};
  const newMember = await collection.findOne(filter);
  if (newMember == null) {
    return {error: `User ${email} not found`};
  }
  const callingUser = context.user;
  
  if (newMember._id === callingUser.id) {
    return {error: "You are already on your own team!"};
  }
  
  if (callingUser.team && callingUser.team.includes(callingUser.id)) {
    return {error: `User ${email} is already a member of your team`};
  }
  
  const projectPartition = `project=${callingUser.id}`;

  try {
    return await collection.updateOne(
      {_id: newMember._id},
      {$addToSet: {
          canWritePartitions: projectPartition,
          memberOf: {
            name: `${callingUser.custom_data.name}'s Project`,
            partition: projectPartition,
          }
        }
      });
  } catch (error) {
    return {error: error.toString()};
  }
};