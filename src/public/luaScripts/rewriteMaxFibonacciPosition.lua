local key = KEYS[1];
local position = ARGV[1];
local currentPosition = tonumber(position);

local oldPosition = redis.call('GET', key);

local function isempty(s)
  return s == nil or s == ''
end

local function setNewPosition(value)
  redis.call('SET', key, value);
end

if type(oldPosition) == "nil" then
  if oldPosition < currentPosition then
    setNewPosition(currentPosition);
    return {key, currentPosition}
  else
    return {key, oldPosition}
  end
else
  setNewPosition(currentPosition);
  return {key, currentPosition};
end
