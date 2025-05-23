/* Executive - executive/enums/propositions.js
   This defines enums for creating custom propositions for legislation. */

module.exports = {
    type: {
        trueFalse: 0,
        motion: 1
    },
    category: {
        crime: "Crime",
        education: "Education",
        elections: "Elect",
        environment: "Environment",
        guns: "Guns",
        health: "Health",
        immigration: "Immigration",
        miscellaneous: "Misc",
        poverty: "Poverty",
        socialSecurity: "Social Security",
        taxes: "Tax",
        veterans: "Veteran",
        senateRules: "ussRules"
    },
    level: {
        school: "school",
        city: "city",
        state: "state",
        national: "nation"
    }
};