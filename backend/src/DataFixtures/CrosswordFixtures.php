<?php

namespace App\DataFixtures;

use App\Entity\CrosswordQuestion;
use App\Repository\SessionRepository;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class CrosswordFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $session = $this->getReference('session_1', \App\Entity\Session::class);

        $questions = [
            ['definition' => 'Mélange de deux liquides non miscibles stabilisé par un émulsifiant', 'motCorrect' => 'EMULSION'],
            ['definition' => 'Ingrédient qui retient l\'eau dans la formule', 'motCorrect' => 'HUMECTANT'],
            ['definition' => 'Substance qui prévient l\'oxydation des ingrédients', 'motCorrect' => 'ANTIOXYDANT'],
            ['definition' => 'Agent qui permet de mélanger l\'eau et l\'huile', 'motCorrect' => 'EMULSIFIANT'],
            ['definition' => 'Mesure d\'acidité d\'une formule', 'motCorrect' => 'PH'],
        ];

        foreach ($questions as $q) {
            $question = new CrosswordQuestion();
            $question->setDefinition($q['definition']);
            $question->setMotCorrect($q['motCorrect']);
            $question->setSession($session);
            $manager->persist($question);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [SessionFixtures::class];
    }
}