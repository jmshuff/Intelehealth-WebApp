const saveToStorage = (name, value) => {
    localStorage.setItem(name, JSON.stringify(value));
}

const getFromStorage = (name) => {
    const item = localStorage.getItem(name);
    if (item !== 'undefined') {
        return JSON.parse(item);
    } else return undefined;
}

const deleteFromStorage = (name) => {
    localStorage.removeItem(name);
}

const getEncounterProviderUUID = () => {
    return getFromStorage('visitNoteProvider').encounterProviders[0].provider.uuid;
}

const getEncounterUUID = () => {
    if (getFromStorage('concordance')) {
        return getFromStorage('concordanceEncounter').uuid;
    } else {
        return getFromStorage('visitNoteProvider').uuid;
    }
    
}

const checkReview = (visitId) => {
    const allReviewVisit1 = getFromStorage('allReviewVisit1') || [];
    const allReviewVisit2 = getFromStorage('allReviewVisit2') || [];
    const review1 = allReviewVisit1.filter(vi => vi.visitId === visitId);
    const review2 = allReviewVisit2.filter(vi => vi.visitId === visitId);
    let show = false, reviewType = 0;
    if (review1.length) {
        reviewType = 1;
        if (review1[0].seen) {
            show = true;
        } else {
            show = false;
        }
    }
    if (review2.length) {
        reviewType = 2;
        if (review2[0].seen) {
            show = true;
        } else {
            show = false;
        }
    }
    return {
        review1, review2, show, reviewType
    }
}