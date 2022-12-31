local key = KEYS[1];

local currentIndex;
local previousIndex = redis.call('GET', key);

if (previousIndex) then
  currentIndex = previousIndex + 1
else
  currentIndex = 1;
end

redis.call('SET', key, currentIndex);

return {currentIndex};
