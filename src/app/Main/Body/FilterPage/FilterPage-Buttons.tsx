import React from 'react';
import { NavLink } from "react-router-dom";
import { Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';


export function FilterPageButtonsComponent(): JSX.Element {
    const { t } = useTranslation(['FilterPage']);
    return (
        <div>
            <Button variant="contained" color="primary" >
                {t('Buttons.Submit')}
            </Button>
            <NavLink to="/filter">
                <Button variant="contained">
                    {t('Buttons.Delete')}
                </Button>
            </NavLink>
        </div>
    )
}
