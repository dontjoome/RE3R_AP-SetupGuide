$(function() {
    const updateScenarioFromDatapackageDropdown = function() {
        let character = 'jill';
        let scenario = 'a';
        let dropdown_value = $("select[name='datapackage_scenario']").val();

        if (dropdown_value) {
            [character, scenario] = dropdown_value.split('_');
        }

        loadDatapackage(character, scenario);
    };

    if (window.location.hash != '') {
        const nav_link = $(`a.nav-link[href='${window.location.hash}']`);

        if (nav_link.length > 0) {
            navLinkActive(nav_link);
            pageActiveFromNavLink(nav_link);

            if (window.location.hash == '#datapackage') {
                updateScenarioFromDatapackageDropdown();
            }
        }
    }

    $('a.nav-link').click(function() {
        navLinkActive($(this));
        pageActiveFromNavLink($(this));
    });

    $('button.next-step').click(function() {
        const href = $(this).attr('data-step');
        const nav_link = $(`a.nav-link[href='${href}']`);

        navLinkActive(nav_link);
        pageActiveFromNavLink(nav_link);
    });

    $('#link_datapackage').click(updateScenarioFromDatapackageDropdown);
    $("select[name='datapackage_scenario']").change(updateScenarioFromDatapackageDropdown);

    $('img').on('click', function(e) {
        $('#imgViewer').empty().append( $(e.currentTarget).clone().removeClass('img-responsive').removeClass('img-thumbnail') );
        $('#viewImg').modal('show');
    });
});

function navLinkActive(obj) {
    $('a.nav-link').removeClass('active');
    $(obj).addClass('active');
}

function pageActiveFromNavLink(obj) {
    const targetPage = $(obj).attr('href');
    
    $('div.page').removeClass('active');
    $(targetPage).addClass('active');

    history.pushState({}, "", targetPage);
}

function loadDatapackage(character, scenario) {
    const item_data = $.get(`data/${character}/items.json`).done(function (data) { return data; });
    const location_data = $.get(`data/${character}/${scenario}/locations.json`).done(function (data) { return data; });
    const location_hardcore_data = $.get(`data/${character}/${scenario}/locations_hardcore.json`).done(function (data) { return data; });
    const location_nightmare_data = $.get(`data/${character}/${scenario}/locations_nightmare.json`).done(function (data) { return data; });
    const location_inferno_data = $.get(`data/${character}/${scenario}/locations_inferno.json`).done(function (data) { return data; });

    Promise.all([item_data, location_data, location_hardcore_data, location_nightmare_data, location_inferno_data]).then(
        function (combined_data) {
            const [items, locations, locations_hardcore, locations_nightmare, locations_inferno] = combined_data;

            const panel_items = $('#datapackage div.panel-items');
            const panel_locations = $('#datapackage div.panel-locations');

            panel_items.empty();
            panel_locations.empty();

            $('<h4 />').html('Items:').prependTo(panel_items);
            $('<em />').html('Names in parentheses are item groups that can be hinted for.').appendTo(panel_items);
            $('<h4 />').html('Locations:').prependTo(panel_locations);

            const list_items = $('<ul />').appendTo(panel_items);
            const list_locations = $('<ul />').appendTo(panel_locations);
            $('<h4 />').html('Hardcore Locations:').appendTo(panel_locations);
            const list_locations_hardcore = $('<ul />').appendTo(panel_locations);
            $('<h4 />').html('Nightmare Locations:').appendTo(panel_locations);
            const list_locations_nightmare = $('<ul />').appendTo(panel_locations);
            $('<h4 />').html('Inferno Locations:').appendTo(panel_locations);
            const list_locations_inferno = $('<ul />').appendTo(panel_locations);

            items.forEach(function (item) {
                const groups = ('groups' in item ? item['groups'] : null);

                $('<li />').html(item['name'] + (groups ? ' (' + groups.join(', ') + ')' : '')).appendTo(list_items);
            });

            locations.forEach(function (location) {
                $('<li />').html(`${location['region']}: ${location['name']}`).appendTo(list_locations);
            });

            locations_hardcore.forEach(function (location) {
                $('<li />').html(`${location['region']}: ${location['name']}`).appendTo(list_locations_hardcore);
            });

            locations_nightmare.forEach(function (location) {
                $('<li />').html(`${location['region']}: ${location['name']}`).appendTo(list_locations_nightmare);
            });
 
            locations_inferno.forEach(function (location) {
                $('<li />').html(`${location['region']}: ${location['name']}`).appendTo(list_locations_inferno);
            });
        }
    );
}

function exportYAML() {
    const form_object = $('#form_yaml');
    const tab = '    '; // tab = 4 spaces, since \t doesn't work on export
    let form_data = {};

    for (const item of form_object.serializeArray()) {
        form_data[item['name']] = item['value'];
    }

    console.log(form_data);

    const player_name = (form_data['player_name'] != '' ? form_data['player_name'] : 'Player');

    let fileContents = `name: ${player_name}\n` +
        "game: Resident Evil 3 Remake\n" +
        "requires:\n" + 
        `${tab}version: 0.5.0\n\n` +
        "Resident Evil 3 Remake:\n" +
        `${tab}progression_balancing: 50\n` +
        `${tab}accessibility: items\n`;

    fileContents += `${tab}character: ${form_data['character']}\n` +
        `${tab}scenario: ${form_data['scenario']}\n` +
        `${tab}difficulty: ${form_data['difficulty']}\n` +
        `${tab}death_link: ${form_data['death_link'] == 'on' ? true : false}\n`;

    fileContents += `${tab}starting_hip_pouches: ${form_data['starting_hip_pouches']}\n` +
        `${tab}bonus_start: ${form_data['bonus_start'] == 'on' ? true : false}\n` +
        `${tab}extra_downtown_items: ${form_data['extra_downtown_items'] == 'on' ? true : false}\n` +
        `${tab}extra_sewer_items: ${form_data['extra_sewer_items'] == 'on' ? true : false}\n` +
        `${tab}allow_progression_downtown: ${form_data['allow_progression_downtown'] == 'on' ? true : false}\n` +
        `${tab}allow_progression_in_labs: ${form_data['allow_progression_in_labs'] == 'on' ? true : false}\n`;

    fileContents += `${tab}oops_all_grenades: ${form_data['oops_all_grenades'] == 'on' ? true : false}\n` +
        `${tab}oops_all_handguns: ${form_data['oops_all_handguns'] == 'on' ? true : false}\n`;

    fileContents += `${tab}no_first_aid_spray: ${form_data['no_first_aid_spray'] == 'on' ? true : false}\n` +
        `${tab}no_green_herb: ${form_data['no_green_herb'] == 'on' ? true : false}\n` +
        `${tab}no_red_herb: ${form_data['no_red_herb'] == 'on' ? true : false}\n` +
        `${tab}no_gunpowder: ${form_data['no_gunpowder'] == 'on' ? true : false}\n`;

    fileContents += `${tab}add_damage_traps: ${form_data['add_damage_traps'] == 'on' ? true : false}\n` +
        `${tab}damage_trap_count: ${form_data['damage_trap_count']}\n` +
        `${tab}damage_traps_can_kill: ${form_data['damage_traps_can_kill'] == 'on' ? true : false}\n`;

    const file = new Blob([fileContents], { type: 'text/yaml' });
    saveAs(file, `RE3R_${player_name}.yaml`);
}
