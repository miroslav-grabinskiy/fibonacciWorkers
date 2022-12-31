local ticketStatusValuePosition;

local function getTicketStatus(ticket)
    local statusValue = "";

    local startPos, lastPos = string.find(ticket, '"status":');
    ticketStatusValuePosition = lastPos + 1;

    local char = string.sub(ticket, ticketStatusValuePosition, ticketStatusValuePosition);
    do return char end
end

local function replaceAt( str, at, with ) return string.sub(str, 1, at-1 )..with..(string.sub(str, at+1, string.len(str))) end

local ticketId = KEYS[1];
local ticket = redis.call('GET', ticketId);
local status = getTicketStatus(ticket);

if (status == "0") then
  local updatedTicket = replaceAt(ticket, ticketStatusValuePosition, 1);
  redis.call('SET', ticketId, updatedTicket);
  local ticketUpdationResult = 1;
  return {ticketId, status, ticketUpdationResult}
else
  local ticketUpdationResult = 0;
  return {ticketId, status, ticketUpdationResult}
end
