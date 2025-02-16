/*
* Function to check if givent category (current_cat) is contained in checked_categories array. This function is exclusively
* used for setting checkbox state when rendering a view. 
* TRUE - return String 'checked'
* FALSE - return String ''
*/
function getCheckboxState(checked_categories, current_cat){
    
    if (checked_categories.includes(current_cat)){
        return 'checked';
    } else {
        return '';
    }
}

module.exports = {getCheckboxState};