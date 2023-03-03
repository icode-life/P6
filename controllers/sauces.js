const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.likeSauce = (req, res, next) => { 
    Sauce.findOne({_id: req.params.id})
       .then((sauce) => { 
        const user = req.body.userId;
        const uniqueOpinion = !sauce.usersLiked.includes(user) && !sauce.usersDisliked.includes(user);
            switch (req.body.like){
                case 1:
                    console.log('case 1');
                    if (uniqueOpinion){
                        Sauce.updateOne({ _id: req.params.id}, { 
                            $inc: {likes: +1},
                            $push: {usersLiked: req.body.userId}
                            })
                        .then(() => res.status(200).json({message : 'like ajouté!'}))
                        .catch(error => res.status(401).json({ error }));
                        console.log(sauce);
                    }
                break;
                case 0:
                    console.log("case 0");
                    if(sauce.usersLiked.includes(req.body.userId)){
                        console.log('0 if');
                        Sauce.updateOne({_id: req.params.id}, {
                            $inc: {likes: -1},
                            $pull: {usersLiked: req.body.userId}})
                            .then(() => res.status(200).json({message : 'like retiré!'}))
                        .catch(error => res.status(401).json({ error }));
                        console.log(sauce);
                    }else{
                        console.log('0 else');
                        Sauce.updateOne({_id: req.params.id}, {
                            $inc: {dislikes: -1},
                            $pull: {usersDisliked: req.body.userId}})
                        .then(() => res.status(200).json({message : 'dislike retiré!'}))
                        .catch(error => res.status(401).json({ error }));
                        console.log(sauce);
                    }
                break;
                case -1:
                    console.log('case -1');
                    if (uniqueOpinion){
                        Sauce.updateOne({ _id: req.params.id}, { 
                            $inc: {dislikes: +1},
                            $push: {usersDisliked: req.body.userId}
                            })
                        .then(() => res.status(200).json({message : 'dislike ajouté!'}))
                        .catch(error => res.status(401).json({ error }));
                        console.log(sauce);
                    }
                break;
            }
        })
       .catch((error) => {
           res.status(400).json({ error });
       });
};

exports.createSauce = (req, res, next) => {
   const sauceObject = JSON.parse(req.body.sauce);
   delete sauceObject._id;
   delete sauceObject._userId;
   const sauce = new Sauce({
       ...sauceObject,
       likes: req.likes || 0,
       dislikes: req.likes || 0,
       usersLiked: [],
       usersDisliked: [],
       userId: req.auth.userId,
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   });
 
   sauce.save()
   .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
   .catch(error => { res.status(400).json( { error })})
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
   const sauceObject = req.file ? {
       ...JSON.parse(req.body.sauce),
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
   } : { ...req.body };
 
   delete sauceObject._userId;
   Sauce.findOne({_id: req.params.id})
       .then((sauce) => {
           if (sauce.userId != req.auth.userId) {
               res.status(401).json({ message : 'Not authorized'});
           } else {
               Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
               .then(() => res.status(200).json({message : 'Objet modifié!'}))
               .catch(error => res.status(401).json({ error }));
           }
       })
       .catch((error) => {
           res.status(400).json({ error });
       });
};

exports.deleteSauce = (req, res, next) => {
   Sauce.findOne({ _id: req.params.id})
       .then(sauce => {
           if (sauce.userId != req.auth.userId) {
               res.status(401).json({message: 'Not authorized'});
           } else {
               const filename = sauce.imageUrl.split('/images/')[1];
               fs.unlink(`images/${filename}`, () => {
                   Sauce.deleteOne({_id: req.params.id})
                       .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                       .catch(error => res.status(401).json({ error }));
               });
           }
       })
       .catch( error => {
           res.status(500).json({ error });
       });
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};