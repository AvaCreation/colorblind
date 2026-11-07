local saved = GetResourceKvpString('mode') or 'none'
local shown = 'none'

local step = 0.17

local presets = {
    none = { 0, 0, 0 },
    protanopia = { step, 0, 0 },
    deuteranopia = { -step, 0, 0 },
    tritanopia = { 0, step, 0 },
}

function GetFilterMode()
    return saved
end

function ShowFilter(mode)
    local redGreen, blueYellow, saturation

    if presets[mode] then
        redGreen, blueYellow, saturation = table.unpack(presets[mode])
    elseif type(mode) == 'string' then
        redGreen, blueYellow, saturation = mode:match('^custom:(-?[%d.]+):(-?[%d.]+):(-?[%d.]+)$')
        redGreen, blueYellow, saturation = tonumber(redGreen), tonumber(blueYellow), tonumber(saturation)
    end

    if not redGreen or not blueYellow or not saturation then return false end
    shown = mode

    if redGreen == 0 and blueYellow == 0 and saturation == 0 then
        ClearExtraTimecycleModifier()
        return true
    end

    local protan = math.min(math.max(redGreen, 0) / step, 2)
    local deutan = math.min(math.max(-redGreen, 0) / step, 2)
    local tritan = math.min(math.max(blueYellow, 0) / step, 2)
    local total = math.min(protan + deutan + tritan, 1)

    if GetTimecycleModifierIndexByName('colorblind') == -1 then
        CreateTimecycleModifier('colorblind')
    end

    SetTimecycleModifierVar('colorblind', 'postfx_correct_col_r', 1 - 0.12 * protan + 0.25 * deutan, 1.0)
    SetTimecycleModifierVar('colorblind', 'postfx_correct_col_g', 1 + 0.03 * protan - 0.08 * deutan - 0.02 * tritan, 1.0)
    SetTimecycleModifierVar('colorblind', 'postfx_correct_col_b', 1 + 0.06 * protan + 0.15 * tritan, 1.0)
    SetTimecycleModifierVar('colorblind', 'postfx_desaturation', math.min(1 + 0.3 * total + math.max(saturation, 0) * 1.5, 2), 1.0)
    SetExtraTimecycleModifier('colorblind')
    return true
end

function SaveFilter(mode)
    if not ShowFilter(mode) then return false end
    saved = mode

    if mode == 'none' then
        DeleteResourceKvp('mode')
    else
        SetResourceKvp('mode', mode)
    end

    TriggerEvent('colorblind:changed', mode)
    return true
end

CreateThread(function()
    ShowFilter(saved)
    local lastZone = GetTimecycleModifierIndex()

    while true do
        Wait(1000)
        local zone = GetTimecycleModifierIndex()

        if shown ~= 'none' and (zone ~= lastZone or GetExtraTimecycleModifierIndex() == -1) then
            ShowFilter(shown)
        end

        lastZone = zone
    end
end)

AddEventHandler('onResourceStop', function(resource)
    if resource == GetCurrentResourceName() then
        ClearExtraTimecycleModifier()
    end
end)

exports('getMode', function()
    return GetFilterMode()
end)

exports('setMode', function(mode, persist)
    if persist then return SaveFilter(mode) end
    return ShowFilter(mode)
end)

exports('setCustom', function(redGreen, blueYellow, saturation, persist)
    local mode = ('custom:%s:%s:%s'):format(redGreen or 0, blueYellow or 0, saturation or 0)
    if persist then return SaveFilter(mode) end
    return ShowFilter(mode)
end)

exports('reset', function()
    return SaveFilter('none')
end)
