const groupBy = (values, keyFinder) => {
    // using reduce to aggregate values
    return values.reduce((a, b) => {
        // depending upon the type of keyFinder
        // if it is function, pass the value to it
        // if it is a property, access the property
        const key = typeof keyFinder === 'function' ? keyFinder(b) : b[keyFinder];

        // aggregate values based on the keys
        if(!a[key]){
            a[key] = [b];
        }else{
            a[key] = [...a[key], b];
        }

        return a;
    }, {});
};

module.exports = {
    groupBy
}
