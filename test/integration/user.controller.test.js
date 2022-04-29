const chai = require('chai')
const chaiHttp = require('chai-http')
const server= require('../../index')
let database = []

chai.should()
chai.use(chaiHttp)
describe(' Manage users /api/users',()=> {
    describe('UC-201',()=>{
        beforeEach((done)=>{
            database = []
            done()
        })
        it('When a required input is missing, a valid error should be returned', (done) => {
            chai
            .request(server)
            .post('/api/user')
            .send({
                //naam ontbreekt
                email: 'fritske@gmail.com',
                age: 22,
                password: 'crazy',
            })
            .end((err,res)=>{
                res.should.be.an('object');
                let{status, result} = res.body;
                status.should.equals(400)
                result.should.be.a('string').that.equals('name must be a string')
                done()
            })
            
            
            
        })
       
    })
})