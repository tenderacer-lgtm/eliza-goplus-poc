// Add deployer launch count
const creatorAddress = result.creator_address || '';
const holderCount = parseInt(result.holder_count || '0');

// GoPlus sometimes includes this in creator_percent analysis
// For now, we'll add it to the message if available

let deployerInfo = '';
if (creatorAddress && creatorAddress !== '0x0000000000000000000000000000000000000000') {
  // Check if this deployer has history
  // (You'd need to track this or use additional API)
  deployerInfo = `\nDeployer: ${creatorAddress.substring(0, 10)}...${creatorAddress.substring(34)}`;
}
