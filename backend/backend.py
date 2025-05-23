from flask import Flask
from flask import jsonify, request
from flask_sqlalchemy import SQLAlchemy
import os.path
from verify_proof import verify_proof
from flask_cors import CORS, cross_origin
basedir = os.path.abspath(os.path.dirname(__file__))
from collections import defaultdict
from signature_check import check_signature

app = Flask(__name__)
# Allow CORS from any origin on all routes
CORS(app, origins=["http://localhost:5173"])
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'data.sqlite')

db = SQLAlchemy(app)

class Review(db.Model):
    __tablename__ = 'review'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text)
    rating = db.Column(db.Float)
    recommend = db.Column(db.Boolean)
    grade = db.Column(db.Text)
    professor_name = db.Column(db.Text)
    class_name = db.Column(db.Text)
    major = db.Column(db.Text)
    proof = db.Column(db.Text)
    college = db.Column(db.Text)
    department = db.Column(db.Text)
    signature = db.Column(db.Text)
    public_keyX = db.Column(db.Text)
    public_keyY = db.Column(db.Text)

    def __str__(self):
        return str(review_serialize(self))

class Nulifier(db.Model):
    __tablename__ = 'nullifier'
    id = db.Column(db.Integer, primary_key=True)
    college = db.Column(db.Text)
    department = db.Column(db.Text)
    class_name = db.Column(db.Text)
    pk_x = db.Column(db.Text)
    pk_y = db.Column(db.Text)

    def __str__(self):
        return str(nullifier_serialize(self))

def review_serialize(review):
    return {
        'text': review.text,
        'rating': str(review.rating),
        'recommend': str(review.recommend),
        'grade': review.grade,
        'professor_name': review.professor_name,
        'class_name': review.class_name,
        "major": review.major,
        "college": review.college,
        "department": review.department,
        "public_keyX": review.public_keyX,
        "public_keyY": review.public_keyY,
        "signature": review.signature
    }

def nullifier_serialize(nullifier):
    return {
        "college": nullifier.college,
        "department": nullifier.department,
        'class_name': nullifier.class_name,
        "pk_x": nullifier.pk_x,
        "pk_y": nullifier.pk_y
    }


@app.route('/')
def sample():
    reviews = db.session.query(Review).all()
    return jsonify([review_serialize(r) for r in reviews])

@app.route('/write_review', methods = ['POST'])
@cross_origin(origins=['http://localhost:5173'])
def write_review():
    # Verify proof 
    try:
        data = request.get_json(silent=True)
        if data is None:
            data = request.form.to_dict()
        if not data: return

        arg_dict = {
            arg_name: data.get(arg_name, "") for arg_name in [
                "text",
                "rating",
                "recommend",
                "grade",
                "professor_name",
                "class_name",
                "major",
                "proof",
                "department",
                "college",
                "signature",
                "public_keyX",
                "public_keyY"
            ]
        }

        nullifier_args = {
            "college": arg_dict["college"],
            "department": arg_dict["department"],
            'class_name': arg_dict["class_name"],
            "pk_x": arg_dict["public_keyX"],
            "pk_y": arg_dict["public_keyY"]
        }

        stmt = (
        db.select(Nulifier.id)       
        .where(db.and_(
            Nulifier.college    == nullifier_args["college"],
            Nulifier.department == nullifier_args["department"],
            Nulifier.class_name == nullifier_args["class_name"],
            Nulifier.pk_x       == nullifier_args["pk_x"],
            Nulifier.pk_y       == nullifier_args["pk_y"],
        ))
        .limit(1)
    )

        if db.session.execute(stmt).first() is not None:
            return jsonify({"error": "Review already submitted - nullifier triggered"}), 500
       
        null_flag = "NOT_USED"
        grade, major = arg_dict["grade"], arg_dict["major"]
        if grade == null_flag:
            if major == null_flag:
                vk = 0
            else:
                vk = 1
        else:
            if major == null_flag:
                vk = 2
            else:
                vk = 3
        
        proof = arg_dict["proof"]
        if not proof or not verify_proof(proof, vk):
            return jsonify({'error': "Proof Verification Failed"}), 500
        
        signature = arg_dict["signature"]
        pkX, pkY = arg_dict["public_keyX"], arg_dict["public_keyY"]
        message = arg_dict["text"]

        if not check_signature(signature, pkX, pkY, message):
            return jsonify({"error": "Invalid Signature"}), 500

        try: arg_dict["rating"] = float(arg_dict["rating"]) 
        except: arg_dict["rating"] = 1.0

        arg_dict["recommend"] = True if arg_dict["recommend"] in ["true", "True"] else False
        
        review = Review(**arg_dict)
        db.session.add(review)
        db.session.commit()

        nullifier = Nulifier(**nullifier_args)
        db.session.add(nullifier)
        db.session.commit()
        
        return jsonify({'message': 'Review added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/read_reviews', methods = ['GET'])
@cross_origin(origins=['http://localhost:5173'])
def read_reviews():
    reviews = Review.query.all()
    result = defaultdict(lambda: defaultdict(list))
    for r in reviews:
        result[r.college][r.department].append(review_serialize(r))

    return jsonify(result)


if __name__ == '__main__':
    if not os.path.exists("data.sqlite"):
        with app.app_context(): 
            db.create_all()      
    app.run(debug=True, port=5001)