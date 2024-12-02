import useAppContext from '@/hooks/useAppContext';
import SubmitReportForm from '@/reportForm';
import { Incident, mapPosition, submitEmergencyFormFn } from '@/types';
import { validatePhoneNumber } from '@/utils/miscUtils';
import { LatLng, latLng } from 'leaflet';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

type IncidentReportDialogProps = {
    dialogID: string,
    formID: string,
    onIncidentFormSubmit: submitEmergencyFormFn,
    onIncidentFormCancel: () => void,
    incidentPosition?: mapPosition
}
const initialFormValues: Incident = {
    id: "",
    date: new Date(),
    status: "open",
    person: {
        name:"",
        phoneNumber:"",
    },
    emergencyDesc: "",
    location: {
        address: "",
        latlng: latLng(0, 0),
        radiusMeters:0,
    },
    pictureLink: "",
    comments: "",
}
export const IncidentReportDialog = ({
    dialogID,
    formID,
    onIncidentFormSubmit,
    onIncidentFormCancel,
    incidentPosition
}: IncidentReportDialogProps) => {
    const [formErrors, setFormErrors] = useState({})
    const [formValues, setFormValues] = useState<Incident>(initialFormValues);

    const { addIncident, setSelectedIncident } = useAppContext()

    function prepareFormSubmit() {
        //first create and add uuid 
        const newUuid = uuidv4();
        const finalValues: Incident = {
            ...formValues,
            id: newUuid,
            status: 'open',
            location: {
                ...formValues.location,
                latlng: new LatLng(incidentPosition.lat, incidentPosition.lon)
            }
        };
        addIncident(finalValues)
        setSelectedIncident(newUuid)
        closeDialog()
    }

    function validateForm() {
        console.log('validating');
        const errors: {[key: string]: any} = {}
        let formIsValid = true
        // Ensure all required fields are included
        if (formValues.person.name.length < 1) errors.name = 'Required'
        if (formValues.person.phoneNumber.length < 1) errors.phoneNumber = 'Required'
        if (formValues.emergencyDesc.length < 1) errors.emergencyDesc = 'Required'
        if (formValues.location.address.length < 1) errors.address = 'Required'
        formIsValid = Object.keys(errors).length === 0

        // Validate inputs
        if (formIsValid) {
            const phoneHasError = !validatePhoneNumber(formValues.person.phoneNumber)
            console.log("phoneHasError", phoneHasError)
            if (phoneHasError) errors.phoneNumber = 'Invalid Phone Number'
            formIsValid = Object.keys(errors).length === 0
        }

        setFormErrors(errors)
        if (formIsValid) prepareFormSubmit()
        
    }

    function closeDialog() {
        const dialog = document.getElementById(dialogID) as HTMLDialogElement
        setFormValues(initialFormValues)
        setFormErrors({})
        dialog.close()
    }


    return (
        <dialog id={dialogID} className="modal" onClose={onIncidentFormCancel}>
            <div className="modal-box">
                <h3 className="font-bold text-lg">Witness Report Form</h3>
                {/* Incident form goes here */}
                <SubmitReportForm 
                    id={formID}
                    values={formValues}
                    errors={formErrors}
                    setValues={setFormValues}
                />
                <div className="modal-action">
                <form method='dialog' className="flex w-full justify-end gap-2">
                    <button onClick={validateForm} type="button" className="btn btn-primary bg-neutral">Submit Report</button>
                    <button onClick={closeDialog} type='reset' className='btn btn-neutral'>Cancel</button>
                </form>
                </div>
            </div>
        </dialog>
    );
};
