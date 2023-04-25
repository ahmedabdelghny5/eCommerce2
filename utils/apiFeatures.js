

class ApiFeature {
    constructor(mongooseQuery, queryData) {
        this.mongooseQuery = mongooseQuery;
        this.queryData = queryData;
    }

    // pagination
    paginate() {
        let page = this.queryData.page * 1 || 1
        if (page < 0) page = 1
        let limit = this.queryData.limit || 4
        let skip = (page - 1) * limit
        this.page = page
        this.mongooseQuery.skip(skip).limit(limit)
        return this
    }

    //filter
    filter() {
        let filterQuery = { ...this.queryData }
        const excludedQuery = ['page', 'limit', 'sort', 'search', 'fields']
        excludedQuery.forEach((param) => {
            delete filterQuery[param]
        })
        filterQuery = JSON.parse(JSON.stringify(filterQuery).replace(/(gt|gte|lt|lte|in|nin|eq|neq)/g, match => `$${match}`))
        this.mongooseQuery.find(filterQuery)
        return this
    }
    //sort
    sort() {
        if (this.queryData.sort) {
            this.queryData.sort = this.queryData.sort.replaceAll(',', ' ')
        }
        this.mongooseQuery.sort(this.queryData.sort)
        return this
    }
    //select
    select() {
        if (this.queryData.fields) {
            this.queryData.fields = this.queryData.fields.replaceAll(',', ' ')
        }
        this.mongooseQuery.select(this.queryData.fields)
        return this
    }
    //search
    search() {
        if (this.queryData.search) {
            this.mongooseQuery.find({
                $or: [
                    { name: { $regex: this.queryData.search, $options: 'i' } },
                    { description: { $regex: this.queryData.search, $options: 'i' } },
                ]
            })
        }
        return this
    }
}

export default ApiFeature