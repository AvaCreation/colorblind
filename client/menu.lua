local isOpen = false

local function open()
    if isOpen then return end
    isOpen = true

    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'open', mode = GetFilterMode(), lang = Config.lang })
end

local function close()
    if not isOpen then return end
    isOpen = false

    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'close' })

    ShowFilter(GetFilterMode())
end

RegisterCommand(Config.command, open, false)

RegisterNUICallback('preview', function(data, cb)
    ShowFilter(data.mode)
    cb({})
end)

RegisterNUICallback('save', function(data, cb)
    SaveFilter(data.mode)
    cb({})
end)

RegisterNUICallback('close', function(_, cb)
    close()
    cb({})
end)

AddEventHandler('onResourceStop', function(resource)
    if resource == GetCurrentResourceName() and isOpen then
        SetNuiFocus(false, false)
    end
end)

exports('open', open)
exports('close', close)

exports('isOpen', function()
    return isOpen
end)
